import mongoose from "mongoose";
import { AddressEnum, GenderEnum, RoleEnum } from "../../common/enums/index.js";
import { generateHash } from "../../common/utils/index.js";

const addressSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            trim: true,
           enum: Object.values(AddressEnum),
            default:AddressEnum.Home,
        },

        street: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            trim: true,
        },

        country: {
            type: String,
            required: true,
            trim: true,
            default: "Egypt",
        },

        postalCode: {
            type: String,
            trim: true,
        },

        building: {
            type: String,
            trim: true,
        },

        apartment: {
            type: String,
            trim: true,
        },

        phone: {
            type: String,
            trim: true,
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: true,
    }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        role: {
            type: String,
            enum: Object.values(RoleEnum),
            default: RoleEnum.User,
        },

        gender: {
            type: String,
            enum: Object.values(GenderEnum),
            default:GenderEnum.Male ,
        },

        address: {
            type: [addressSchema],
            default: [],
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        phone: {
            type: String,
            trim: true,
        },

        DOB: {
            type: Date,
        },

        isBlocked: {
            type: Boolean,
            default: false,
        },

          changeCredentialTime: {
            type: Date,
        },
        ordersHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
            },
        ],
    },
    {
        collection: "User",
        timestamps: true,
        strict: true,
        strictQuery: true,
        optimisticConcurrency: true,
        autoIndex: true,
    }
);


//hash password
userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        return next();
    }

    this.password = await generateHash({
        plaintext: this.password,
    });

});


export const UserModel = mongoose.model.User || mongoose.model("User", userSchema);