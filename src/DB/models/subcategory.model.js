import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true, 
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
    },
    {
        collection: "SubCategory",
        timestamps: true,
        strict: true,
        strictQuery: true,
        optimisticConcurrency: true,
        autoIndex: true,
    }
);


subCategorySchema.index({ category: 1, slug: 1 }, { unique: true });


export const SubCategoryModel = mongoose.models.SubCategory || mongoose.model("SubCategory", subCategorySchema);
