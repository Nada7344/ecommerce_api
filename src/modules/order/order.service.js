import {
    BadRequestException,
    NotFoundException,
} from "../../common/utils/index.js";

import {
    create,
    findById,
    findOne,
    findOneAndUpdate,
    paginate,
    updateOne,
    CartModel,
    OrderModel,
    ProductModel,
    UserModel,
} from "../../DB/index.js";

import { OrderStatusEnum } from "../../common/enums/index.js";


const orderPopulate = [
    { path: "products.productId", select: "name slug images" },
    { path: "userId", select: "name email phone" },
];



const CUSTOMER_CANCELLABLE_STATUSES = [
    OrderStatusEnum.Pending,
    OrderStatusEnum.InProgress,
];


const RESTOCKING_STATUSES = [
    OrderStatusEnum.CancelledByCustomer,
    OrderStatusEnum.CancelledByAdmin,
    OrderStatusEnum.Rejected,
    OrderStatusEnum.Refunded,
];





const resolveAddress = async (user, { addressId, address }) => {

    if (address) {
        return address;
    }

    const target = user.address.id(addressId);

    if (!target) {
        throw new NotFoundException("Address not found");
    }

    return target.toObject();
};


const restockOrder = async (order) => {

    for (const item of order.products) {
        await updateOne({
            model: ProductModel,
            filter: { _id: item.productId },
            update: { $inc: { stock: item.quantity } },
        });
    }
};


const deductStockForOrder = async (order) => {

    for (const item of order.products) {
        const product = await findById({ model: ProductModel, id: item.productId });

        if (!product || product.stock < item.quantity) {
            throw new BadRequestException(
                `Cannot move this order back to an active status: not enough stock for "${product?.name || "one of the products"}"`
            );
        }
    }

    for (const item of order.products) {
        await updateOne({
            model: ProductModel,
            filter: { _id: item.productId },
            update: { $inc: { stock: -item.quantity } },
        });
    }
};





export const createOrder = async (user, inputs) => {

    const cart = await CartModel.findOne({ userId: user._id });

    if (!cart || cart.products.length === 0) {
        throw new BadRequestException("Your cart is empty");
    }

    const address = await resolveAddress(user, inputs);

    const snapshotProducts = [];
    let totalPrice = 0;

    for (const item of cart.products) {

        const product = await findById({ model: ProductModel, id: item.productId });

        if (!product || product.isDeleted || !product.isActive) {
            throw new BadRequestException(
                `One of the products in your cart is no longer available`
            );
        }

        if (product.stock < item.quantity) {
            throw new BadRequestException(
                `Only ${product.stock} unit(s) left for "${product.name}"`
            );
        }

        snapshotProducts.push({
            productId: product._id,
            quantity: item.quantity,
            price: product.price,
        });

        totalPrice += product.price * item.quantity + (product.shippingPrice || 0);
    }

  const order = await create({
    model: OrderModel,
    data: {
        userId: user._id,
        products: snapshotProducts,
        totalPrice,
        address,
        status: OrderStatusEnum.Pending,
    },
});

    for (const item of snapshotProducts) {
        await updateOne({
            model: ProductModel,
            filter: { _id: item.productId },
            update: { $inc: { stock: -item.quantity } },
        });
    }

    await updateOne({
        model: UserModel,
        filter: { _id: user._id },
        update: { $push: { ordersHistory: order._id } },
    });

    cart.products = [];
    await cart.save();

    return order.populate(orderPopulate);
};


export const getMyOrders = async (user, { page, size, status }) => {

    const filter = { userId: user._id };

    if (status) filter.status = status;

    return paginate({
        model: OrderModel,
        filter,
        page,
        size,
        options: {
            sort: { createdAt: -1 },
            populate: orderPopulate,
        },
    });
};


export const getMyOrderById = async (user, orderId) => {

    const order = await findOne({
        model: OrderModel,
        filter: { _id: orderId, userId: user._id },
        options: { populate: orderPopulate },
    });

    if (!order) {
        throw new NotFoundException("Order not found");
    }

    return order;
};


export const cancelMyOrder = async (user, orderId) => {

    const order = await findById({ model: OrderModel, id: orderId });

    if (!order || String(order.userId) !== String(user._id)) {
        throw new NotFoundException("Order not found");
    }

    if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)) {
        throw new BadRequestException(
            `Order can no longer be cancelled once it is "${order.status}"`
        );
    }

    await restockOrder(order);

    return findOneAndUpdate({
        model: OrderModel,
        filter: { _id: orderId },
        update: { status: OrderStatusEnum.CancelledByCustomer },
        options: { populate: orderPopulate },
    });
};



// Admin


export const listOrdersAdmin = async ({ page, size, status, userId, from, to }) => {

    const filter = {};

    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(from);
        if (to) filter.createdAt.$lte = new Date(to);
    }

    return paginate({
        model: OrderModel,
        filter,
        page,
        size,
        options: {
            sort: { createdAt: -1 },
            populate: orderPopulate,
        },
    });
};


export const getOrderByIdAdmin = async (orderId) => {

    const order = await findById({
        model: OrderModel,
        id: orderId,
        options: { populate: orderPopulate },
    });

    if (!order) {
        throw new NotFoundException("Order not found");
    }

    return order;
};


export const updateOrderStatusAdmin = async (orderId, nextStatus) => {

    const order = await findById({ model: OrderModel, id: orderId });

    if (!order) {
        throw new NotFoundException("Order not found");
    }

    if (order.status === nextStatus) {
        throw new BadRequestException(`Order is already "${nextStatus}"`);
    }

    const wasRestocked = RESTOCKING_STATUSES.includes(order.status);
    const willRestock = RESTOCKING_STATUSES.includes(nextStatus);

    if (willRestock && !wasRestocked) {
        await restockOrder(order);
    } else if (!willRestock && wasRestocked) {
        await deductStockForOrder(order);
    }

    return findOneAndUpdate({
        model: OrderModel,
        filter: { _id: orderId },
        update: { status: nextStatus },
        options: { populate: orderPopulate },
    });
};