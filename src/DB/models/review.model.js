import mongoose from "mongoose";
import { ReviewStatusEnum } from "../../common/enums/index.js";


const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        rate: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 1000,
        },

        status: {
            type: String,
            enum: Object.values(ReviewStatusEnum),
            default: ReviewStatusEnum.Pending,
        },
    },
    {
        collection: "Review",
        timestamps: true, // gives us createdAt, matching the SRS field
        strict: true,
        strictQuery: true,
        optimisticConcurrency: true,
        autoIndex: true,
    }
);


// FR-34 — a customer may only rate a given product once
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// speeds up the public "approved reviews for this product" listing
reviewSchema.index({ productId: 1, status: 1 });


export const ReviewModel = mongoose.models.Review || mongoose.model("Review", reviewSchema);
