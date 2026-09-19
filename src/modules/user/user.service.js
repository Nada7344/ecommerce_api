import {
    BadRequestException,
    ConflictException,
    NotFoundException,
    compareHash,
    generateHash,
} from "../../common/utils/index.js";

import {
    createLoginCredentials,
} from "../../common/services/index.js";

import {
    allKeysByPrefix,
    deleteKey,
    revokeTokenKeyPrefix,
} from "../../common/services/index.js";

import {
    findById,
    findOne,
    findOneAndUpdate,
    paginate,
    updateOne,
    UserModel,
} from "../../DB/index.js";



export const getProfile = async (user) => {
    return user;
};


export const updateProfile = async (user, inputs) => {

    const updatedUser = await findOneAndUpdate({
        model: UserModel,
        filter: { _id: user._id },
        update: inputs,
    });

    return updatedUser;
};



export const updatePassword = async (user, inputs, issuer) => {

    const { oldPassword, password } = inputs;

    const userWithPassword = await findOne({
        model: UserModel,
        filter: { _id: user._id },
        select: "+password",
    });

    const isOldPasswordCorrect = await compareHash({
        plaintext: oldPassword,
        ciphertext: userWithPassword.password,
    });

    if (!isOldPasswordCorrect) {
        throw new ConflictException("Invalid old password");
    }

    await updateOne({
        model: UserModel,
        filter: { _id: user._id },
        update: {
            password: await generateHash({
                plaintext: password,
            }),
            changeCredentialTime: new Date(),
        },
    });

    const staleKeys = await allKeysByPrefix(
        revokeTokenKeyPrefix({
            userId: user._id,
        })
    );

    await deleteKey({ key: staleKeys });

    return createLoginCredentials(user, issuer);
};



export const addAddress = async (user, address) => {

    if (address.isDefault) {
        await updateOne({
            model: UserModel,
            filter: { _id: user._id },
            update: { $set: { "address.$[].isDefault": false } },
        });
    }

    const updatedUser = await findOneAndUpdate({
        model: UserModel,
        filter: { _id: user._id },
        update: { $push: { address } },
    });

    return updatedUser.address;
};


export const updateAddress = async (user, addressId, inputs) => {

    const target = user.address.id(addressId);

    if (!target) {
        throw new NotFoundException("Address not found");
    }

    if (inputs.isDefault) {
        await updateOne({
            model: UserModel,
            filter: { _id: user._id },
            update: { $set: { "address.$[].isDefault": false } },
        });
    }

    const setPayload = {};

    for (const key of Object.keys(inputs)) {
        setPayload[`address.$.${key}`] = inputs[key];
    }

    const updatedUser = await findOneAndUpdate({
        model: UserModel,
        filter: { _id: user._id, "address._id": addressId },
        update: { $set: setPayload },
    });

    if (!updatedUser) {
        throw new NotFoundException("Address not found");
    }

    return updatedUser.address;
};


export const deleteAddress = async (user, addressId) => {

    const target = user.address.id(addressId);

    if (!target) {
        throw new NotFoundException("Address not found");
    }

    const updatedUser = await findOneAndUpdate({
        model: UserModel,
        filter: { _id: user._id },
        update: { $pull: { address: { _id: addressId } } },
    });

    return updatedUser.address;
};




export const getOrdersHistory = async (user) => {

    const populatedUser = await findById({
        model: UserModel,
        id: user._id,
        select: "ordersHistory",
        options: { populate: [{ path: "ordersHistory" }] },
    });

    return populatedUser.ordersHistory;
};




export const listUsers = async ({ page, size }) => {
    return paginate({
        model: UserModel,
        select: "-password",
        page,
        size,
    });
};


export const getUserById = async (userId) => {

    const user = await findById({
        model: UserModel,
        id: userId,
        select: "-password",
    });

    if (!user) {
        throw new NotFoundException("User not found");
    }

    return user;
};


export const setUserBlockedStatus = async (userId, isBlocked) => {

    const updatedUser = await findOneAndUpdate({
        model: UserModel,
        filter: { _id: userId },
        update: {
            isBlocked,
           
            ...(isBlocked ? { changeCredentialTime: new Date() } : {}),
        },
        options: { select: "-password" },
    });

    if (!updatedUser) {
        throw new NotFoundException("User not found");
    }

    return updatedUser;
};