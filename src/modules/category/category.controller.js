import { Router } from "express";

import {
    createCategory,
    createSubCategory,
    deleteCategory,
    deleteSubCategory,
    getCategoryById,
    getNavbarCategories,
    listCategoriesAdmin,
    updateCategory,
    updateSubCategory,
} from "./category.service.js";

import * as validators from "./category.validation.js";
import { endpoint } from "../../common/utils/index.js";

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




router.get(
    "/navbar",
    asyncHandler(async (req, res) => {
        const categories = await getNavbarCategories();
        return successResponse({ res, data: { categories } });
    })
);




router.post(
    "/admin",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.createCategory),
    asyncHandler(async (req, res) => {
        const category = await createCategory(req.body);
        return successResponse({ res, status: 201, data: { category } });
    })
);


router.get(
    "/admin",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.listCategories),
    asyncHandler(async (req, res) => {
        const result = await listCategoriesAdmin(req.query);
        return successResponse({ res, data: { ...result } });
    })
);


router.get(
    "/admin/:categoryId",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.categoryIdParam),
    asyncHandler(async (req, res) => {
        const category = await getCategoryById(req.params.categoryId);
        return successResponse({ res, data: { category } });
    })
);


router.patch(
    "/admin/:categoryId",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.updateCategory),
    asyncHandler(async (req, res) => {
        const category = await updateCategory(req.params.categoryId, req.body);
        return successResponse({ res, data: { category } });
    })
);


router.delete(
    "/admin/:categoryId",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.categoryIdParam),
    asyncHandler(async (req, res) => {
        const category = await deleteCategory(req.params.categoryId);
        return successResponse({ res, data: { category } });
    })
);




router.post(
    "/admin/:categoryId/subcategory",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.createSubCategory),
    asyncHandler(async (req, res) => {
        const subCategory = await createSubCategory(req.params.categoryId, req.body);
        return successResponse({ res, status: 201, data: { subCategory } });
    })
);


router.patch(
    "/admin/subcategory/:subCategoryId",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.updateSubCategory),
    asyncHandler(async (req, res) => {
        const subCategory = await updateSubCategory(req.params.subCategoryId, req.body);
        return successResponse({ res, data: { subCategory } });
    })
);


router.delete(
    "/admin/subcategory/:subCategoryId",
    authentication(),
    authorization(endpoint.adminOnly),
    validation(validators.subCategoryIdParam),
    asyncHandler(async (req, res) => {
        const subCategory = await deleteSubCategory(req.params.subCategoryId);
        return successResponse({ res, data: { subCategory } });
    })
);


export default router;
