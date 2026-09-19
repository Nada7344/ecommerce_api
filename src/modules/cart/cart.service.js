import {
    BadRequestException,
    NotFoundException,
} from "../../common/utils/index.js";

import {
    findById,
    findOne,
 CartModel,
    ProductModel,
} from "../../DB/index.js";


const cartPopulate = [
    {
        path: "products.productId",
        select: "name slug images price stock isActive isDeleted",
    },
];





const validateProductForCart = async (productId, quantity) => {

    const product = await findById({ model: ProductModel, id: productId });

    if (!product || product.isDeleted || !product.isActive) {
        throw new NotFoundException("Product not found or unavailable");
    }

    if (product.stock < quantity) {
        throw new BadRequestException(
            `Only ${product.stock} unit(s) left in stock for "${product.name}"`
        );
    }

    return product;
};


const getOrCreateCartDoc = async (userId) => {

    const cart = await CartModel.findOne({ userId });

    return cart || new CartModel({ userId, products: [] });
};


const findItem = (cart, productId) => {
    return cart.products.find(
        (item) => item.productId.toString() === productId
    );
};





export const getCart = async (user) => {

    const cart = await findOne({
        model: CartModel,
        filter: { userId: user._id },
        options: { populate: cartPopulate },
    });

    return cart || { userId: user._id, products: [] };
};


export const addToCart = async (user, { productId, quantity = 1 }) => {

    const cart = await getOrCreateCartDoc(user._id);

    const existingItem = findItem(cart, productId);

    const targetQuantity = (existingItem?.quantity || 0) + quantity;

    const product = await validateProductForCart(productId, targetQuantity);

    if (existingItem) {
        existingItem.quantity = targetQuantity;
        existingItem.price = product.price;
    } else {
        cart.products.push({
            productId,
            quantity,
            price: product.price,
        });
    }

    await cart.save();

    return cart.populate(cartPopulate);
};


export const updateCartItem = async (user, productId, quantity) => {

    const cart = await CartModel.findOne({ userId: user._id });

    if (!cart) {
        throw new NotFoundException("Cart not found");
    }

    const item = findItem(cart, productId);

    if (!item) {
        throw new NotFoundException("Product not found in cart");
    }

    const product = await validateProductForCart(productId, quantity);

    item.quantity = quantity;
    item.price = product.price;

    await cart.save();

    return cart.populate(cartPopulate);
};


export const removeCartItem = async (user, productId) => {

    const cart = await CartModel.findOne({ userId: user._id });

    if (!cart) {
        throw new NotFoundException("Cart not found");
    }

    const beforeCount = cart.products.length;

    cart.products = cart.products.filter(
        (item) => item.productId.toString() !== productId
    );

    if (cart.products.length === beforeCount) {
        throw new NotFoundException("Product not found in cart");
    }

    await cart.save();

    return cart.populate(cartPopulate);
};


export const clearCart = async (user) => {

    const cart = await CartModel.findOne({ userId: user._id });

    if (!cart) {
        return { userId: user._id, products: [] };
    }

    cart.products = [];

    await cart.save();

    return cart;
};





export const syncCart = async (user, items = []) => {

    const cart = await getOrCreateCartDoc(user._id);

    const skipped = [];

    for (const { productId, quantity } of items) {

        const product = await findById({ model: ProductModel, id: productId });

        if (!product || product.isDeleted || !product.isActive) {
            skipped.push({ productId, reason: "unavailable" });
            continue;
        }

        const existingItem = findItem(cart, productId);

        const mergedQuantity = Math.min(
            (existingItem?.quantity || 0) + quantity,
            product.stock
        );

        if (mergedQuantity <= 0) {
            skipped.push({ productId, reason: "out_of_stock" });
            continue;
        }

        if (existingItem) {
            existingItem.quantity = mergedQuantity;
            existingItem.price = product.price;
        } else {
            cart.products.push({
                productId,
                quantity: mergedQuantity,
                price: product.price,
            });
        }
    }

    await cart.save();

    return {
        cart: await cart.populate(cartPopulate),
        skipped,
    };
};
