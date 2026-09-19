import mongoose from "mongoose";


const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 200,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 2000,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        shippingPrice: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
        },

        images: [
            {
                secure_url: {
                    type: String,
                },
                public_id: {
                    type: String,
                },
                 _id: false,
            },
        ],

        flags: {
            topSales: {
                type: Boolean,
                default: false,
            },
            newArrival: {
                type: Boolean,
                default: false,
            },
        },

        ratingsAverage: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
    },
    {
        collection: "Product",
        timestamps: true,
        strict: true,
        strictQuery: true,
        optimisticConcurrency: true,
        autoIndex: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);



productSchema.virtual("isOutOfStock").get(function () {
    return this.stock === 0;
});



productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ isActive: 1, isDeleted: 1 });
productSchema.index({ "flags.topSales": 1 });
productSchema.index({ "flags.newArrival": 1 });


export const ProductModel = mongoose.models.Product || mongoose.model("Product", productSchema);
