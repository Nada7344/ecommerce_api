import mongoose from "mongoose";
import { OrderStatusEnum } from "../../common/enums/index.js";


const orderProductSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        
        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);


const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        products: {
            type: [orderProductSchema],
            required: true,
            validate: {
                validator: (items) => Array.isArray(items) && items.length > 0,
                message: "Order must contain at least one product",
            },
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        orderedAt: {
            type: Date,
            default: Date.now,
        },

        address: {
            type: Object,
            required: true,
        },

        status: {
            type: String,
            enum: Object.values(OrderStatusEnum),
            default: OrderStatusEnum.Pending,
        },
    },
    {
        collection: "Order",
        timestamps: true,
        strict: true,
        strictQuery: true,
        optimisticConcurrency: true,
        autoIndex: true,
    }
);


orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });


export const OrderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);
