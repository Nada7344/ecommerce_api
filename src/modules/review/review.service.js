import {
    ConflictException,
    NotFoundException,
    emailEvent,
    sendEmail,
} from "../../common/utils/index.js";

import {
    create,
    find,
    findById,
    findOne,
    findOneAndUpdate,
    paginate,
    ProductModel,
    ReviewModel,
    UserModel,
} from "../../DB/index.js";

import {
    ReviewStatusEnum,
    RoleEnum,
    SubjectEnum,
} from "../../common/enums/index.js";


const reviewPopulate = [
    { path: "userId", select: "name email" },
    { path: "productId", select: "name slug images" },
];


// helpers


const recalculateProductRating = async (productId) => {

    const [stats] = await ReviewModel.aggregate([
        {
            $match: {
                productId,
                status: ReviewStatusEnum.Approved,
            },
        },
        {
            $group: {
                _id: "$productId",
                averageRate: { $avg: "$rate" },
            },
        },
    ]);

    await ProductModel.updateOne(
        { _id: productId },
        { ratingsAverage: stats ? Math.round(stats.averageRate * 10) / 10 : 0 }
    );
};



const notifyAdminsNewReview = async (review) => {

    const admins = await find({
        model: UserModel,
        filter: { role: RoleEnum.Admin },
        select: "email",
    });

    if (!admins.length) {
        return;
    }

    emailEvent.emit("SendEmail", async () => {
        await sendEmail({
            to: admins.map((admin) => admin.email),
            subject: SubjectEnum.NewReviewPending,
            html: `
                <p>A new review is waiting for your review.</p>
                <p><strong>Product:</strong> ${review.productId.name}</p>
                <p><strong>Customer:</strong> ${review.userId.name}</p>
                <p><strong>Rating:</strong> ${review.rate} / 5</p>
                <p><strong>Message:</strong> ${review.message}</p>
            `,
        });
    });
};




export const createReview = async (user, { productId, rate, message }) => {

    const product = await findById({ model: ProductModel, id: productId });

    if (!product || product.isDeleted) {
        throw new NotFoundException("Product not found");
    }


    const existingReview = await findOne({
        model: ReviewModel,
        filter: { userId: user._id, productId },
    });

    if (existingReview) {
        throw new ConflictException("You have already reviewed this product");
    }

    const review = await create({
        model: ReviewModel,
        data: {
            userId: user._id,
            productId,
            rate,
            message,
            status: ReviewStatusEnum.Pending, 
        },
    });

    const populatedReview = await review.populate(reviewPopulate);

    await notifyAdminsNewReview(populatedReview); 

    return populatedReview;
};


export const getMyReviews = async (user, { page, size }) => {

    return paginate({
        model: ReviewModel,
        filter: { userId: user._id },
        page,
        size,
        options: {
            sort: { createdAt: -1 },
            populate: [{ path: "productId", select: "name slug images" }],
        },
    });
};




export const getFeaturedReviews = async (limit = 6) => {

    return ReviewModel
        .find({ status: ReviewStatusEnum.Approved })
        .sort({ rate: -1, createdAt: -1 })
        .limit(Number(limit) || 6)
        .populate(reviewPopulate)
        .lean();

};


export const getProductReviews = async (productId, { page, size }) => {

    return paginate({
        model: ReviewModel,
        filter: { productId, status: ReviewStatusEnum.Approved },
        page,
        size,
        options: {
            sort: { createdAt: -1 },
            populate: [{ path: "userId", select: "name" }],
        },
    });
};





export const listReviewsAdmin = async ({ page, size, status, productId }) => {

    const filter = {};

    if (status) filter.status = status;
    if (productId) filter.productId = productId;

    return paginate({
        model: ReviewModel,
        filter,
        page,
        size,
        options: {
            sort: { createdAt: -1 },
            populate: reviewPopulate,
        },
    });
};


export const updateReviewStatusAdmin = async (reviewId, status) => {

    const review = await findOneAndUpdate({
        model: ReviewModel,
        filter: { _id: reviewId },
        update: { status },
        options: { populate: reviewPopulate },
    });

    if (!review) {
        throw new NotFoundException("Review not found");
    }

    await recalculateProductRating(review.productId._id);

    return review;
};