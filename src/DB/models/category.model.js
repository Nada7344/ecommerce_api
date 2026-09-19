import mongoose from "mongoose";


const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        collection: "Category",
        timestamps: true,
        strict: true,
        strictQuery: true,
        optimisticConcurrency: true,
        autoIndex: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


categorySchema.virtual("subcategories", {
    ref: "SubCategory",
    localField: "_id",
    foreignField: "category",
});



export const CategoryModel = mongoose.models.Category || mongoose.model("Category", categorySchema);


