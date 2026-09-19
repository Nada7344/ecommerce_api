import {
    OrderModel,
    ProductModel,
    UserModel,
} from "../../DB/index.js";

import {
    OrderStatusEnum,
    ReportGroupByEnum,
    RoleEnum,
} from "../../common/enums/index.js";


const REVENUE_EXCLUDED_STATUSES = [
    OrderStatusEnum.CancelledByCustomer,
    OrderStatusEnum.CancelledByAdmin,
    OrderStatusEnum.Rejected,
    OrderStatusEnum.Refunded,
];


const DATE_FORMAT_BY_GROUP = {
    [ReportGroupByEnum.Day]: "%Y-%m-%d",
    [ReportGroupByEnum.Week]: "%G-W%V", 
    [ReportGroupByEnum.Month]: "%Y-%m",
};


// helpers


const buildDateMatch = (from, to, field) => {

    if (!from && !to) {
        return {};
    }

    const range = {};

    if (from) range.$gte = new Date(from);
    if (to) range.$lte = new Date(to);

    return { [field]: range };
};





export const getOverview = async ({ from, to }) => {

    const dateMatch = buildDateMatch(from, to, "orderedAt");

    const [statusBreakdown, revenueAgg, totalUsers, totalProducts] = await Promise.all([

        OrderModel.aggregate([
            { $match: dateMatch },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),

        OrderModel.aggregate([
            {
                $match: {
                    ...dateMatch,
                    status: { $nin: REVENUE_EXCLUDED_STATUSES },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                    paidOrders: { $sum: 1 },
                },
            },
        ]),

        UserModel.countDocuments({ role: RoleEnum.User }),
        ProductModel.countDocuments({ isDeleted: false }),
    ]);


    const ordersByStatus = Object.fromEntries(
        Object.values(OrderStatusEnum).map((status) => [status, 0])
    );

    let totalOrders = 0;

    for (const entry of statusBreakdown) {
        ordersByStatus[entry._id] = entry.count;
        totalOrders += entry.count;
    }

    return {
        totalOrders,
        ordersByStatus,
        totalRevenue: revenueAgg[0]?.totalRevenue || 0,
        paidOrders: revenueAgg[0]?.paidOrders || 0,
        totalUsers,
        totalProducts,
    };
};





export const getSalesReport = async ({ from, to, groupBy = ReportGroupByEnum.Day }) => {

    const dateMatch = buildDateMatch(from, to, "orderedAt");

    const series = await OrderModel.aggregate([
        {
            $match: {
                ...dateMatch,
                status: { $nin: REVENUE_EXCLUDED_STATUSES },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: DATE_FORMAT_BY_GROUP[groupBy],
                        date: "$orderedAt",
                    },
                },
                revenue: { $sum: "$totalPrice" },
                ordersCount: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, period: "$_id", revenue: 1, ordersCount: 1 } },
    ]);

    return { groupBy, series };
};





export const getTopProducts = async ({ from, to, limit = 5 }) => {

   
    limit = Number(limit) || 5;

    const dateMatch = buildDateMatch(from, to, "orderedAt");

    const topProducts = await OrderModel.aggregate([
        {
            $match: {
                ...dateMatch,
                status: { $nin: REVENUE_EXCLUDED_STATUSES },
            },
        },
        { $unwind: "$products" },
        {
            $group: {
                _id: "$products.productId",
                quantitySold: { $sum: "$products.quantity" },
                revenue: {
                    $sum: { $multiply: ["$products.price", "$products.quantity"] },
                },
            },
        },
        { $sort: { quantitySold: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "Product", 
                localField: "_id",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: "$product" },
        {
            $project: {
                _id: 0,
                productId: "$_id",
                name: "$product.name",
                slug: "$product.slug",
                quantitySold: 1,
                revenue: 1,
            },
        },
    ]);

    return { topProducts };
};





export const getNewUsersReport = async ({ from, to, groupBy = ReportGroupByEnum.Day }) => {

    const dateMatch = buildDateMatch(from, to, "createdAt");

    const series = await UserModel.aggregate([
        { $match: { ...dateMatch, role: RoleEnum.User } },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: DATE_FORMAT_BY_GROUP[groupBy],
                        date: "$createdAt",
                    },
                },
                newUsers: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, period: "$_id", newUsers: 1 } },
    ]);

    return { groupBy, series };
};