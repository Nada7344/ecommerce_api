import mongoose from "mongoose";


const cartProductSchema = new mongoose.Schema(
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


const cartSchema = new mongoose.Schema(
    {
        
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        products: {
            type: [cartProductSchema],
            default: [],
        },
    },
    {
        collection: "Cart",
        timestamps: true,
        strict: true,
        strictQuery: true,
        optimisticConcurrency: true,
        autoIndex: true,
    }
);


cartSchema.index({ userId: 1 }, { unique: true, sparse: true });


export const CartModel = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
