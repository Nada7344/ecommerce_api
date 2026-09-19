import { Router } from "express";

import {
    createProduct,
    getNewArrivals,
    getProductByIdAdmin,
    getProductBySlug,
    getTopSales,
    listProducts,
    listProductsAdmin,
    softDeleteProduct,
    updateProduct,
    updateProductFlags,
    updateProductStatus,
    updateStock,
} from "./product.service.js";

import * as validators from "./product.validation.js";
import { endpoint, fileFieldValidation, cloudFileUpload, uploadFiles } from "../../common/utils/index.js";

import {
    validation,
    authentication,
    authorization,
} from "../../middleware/index.js";

import {
    asyncHandler,
    successResponse,
} from "../../common/utils/index.js";


const router = Router();



// Public - catalog

router.get(
    "/",
    validation(validators.listProducts),
    asyncHandler(async (req, res) => {
        const result = await listProducts(req.query);
        return successResponse({ res, data: { ...result } });
    })
);


router.get(
    "/new-arrivals",
    asyncHandler(async (req, res) => {
        const result = await getNewArrivals(req.query);
        return successResponse({ res, data: { ...result } });
    })
);


router.get(
    "/top-sales",
    asyncHandler(async (req, res) => {
        const result = await getTopSales(req.query);
        return successResponse({ res, data: { ...result } });
    })
);






router.post(
    "/admin",
    authentication(),
    authorization(endpoint.adminOnly),
    cloudFileUpload({
        validation: fileFieldValidation.image,
    }).array("images", 2),
    validation(validators.createProduct),
    asyncHandler(async (req, res) => {        
        const  images =await  uploadFiles({files:req.files ,path:`products`})
        
        const product = await createProduct({
            ...req.body,
            images,
        });
        return successResponse({ res, status: 201, data: { product } });
    })
);


router.get(
    "/admin",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.listProductsAdmin),
    asyncHandler(async (req, res) => {
        const result = await listProductsAdmin(req.query);
        return successResponse({ res, data: { ...result } });
    })
);


router.get(
    "/admin/:productId",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.productIdParam),
    asyncHandler(async (req, res) => {
        const product = await getProductByIdAdmin(req.params.productId);
        return successResponse({ res, data: { product } });
    })
);

router.patch(
    "/admin/:productId",
    authentication(),
    authorization(endpoint.adminOnly),
   cloudFileUpload({
        validation: fileFieldValidation.image,
    }).array("images", 2),
    validation(validators.updateProduct),
    asyncHandler(async (req, res) => {
       
        const images = await uploadFiles({ files: req.files, path: `products` })
        
        const product = await updateProduct(req.params.productId, {
            ...req.body,
            ...(images.length ? { images } : {}),
        });
        return successResponse({ res, data: { product } });
    })
);

router.delete( 
    "/admin/:productId",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.productIdParam),
    asyncHandler(async (req, res) => {
        const product = await softDeleteProduct(req.params.productId);
        return successResponse({ res, data: { product } });
    })
);




router.patch(
    "/admin/:productId/stock",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.updateStock),
    asyncHandler(async (req, res) => {
        const product = await updateStock(req.params.productId, req.body.stock);
        return successResponse({ res, data: { product } });
    })
);




router.patch(
    "/admin/:productId/status",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.updateStatus),
    asyncHandler(async (req, res) => {
        const product = await updateProductStatus(req.params.productId, req.body.isActive);
        return successResponse({ res, data: { product } });
    })
);





router.patch(
    "/admin/:productId/flags",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.updateFlags),
    asyncHandler(async (req, res) => {
        const product = await updateProductFlags(req.params.productId, req.body.flags);
        return successResponse({ res, data: { product } });
    })
);


router.get(
    "/:slug",
    validation(validators.productSlugParam),
    asyncHandler(async (req, res) => {
        const product = await getProductBySlug(req.params.slug);
        return successResponse({ res, data: { product } });
    })
);


export default router;
