import {
    BadRequestException,
    ConflictException,
    NotFoundException,
    generateSlug,
} from "../../common/utils/index.js";

import {
    create,
    find,
    findById,
    findOne,
    findOneAndDelete,
    findOneAndUpdate,
    paginate,
    CategoryModel,
    ProductModel,
    SubCategoryModel,
} from "../../DB/index.js";





const ensureUniqueCategorySlug = async (name, excludeId) => {

    const slug = generateSlug(name);

    const existing = await findOne({
        model: CategoryModel,
        filter: {
            slug,
            ...(excludeId ? { _id: { $ne: excludeId } } : {}),
        },
    });

    if (existing) {
        throw new ConflictException("Category with this name already exists");
    }

    return slug;
};


const ensureUniqueSubCategorySlug = async (name, categoryId, excludeId) => {

    const slug = generateSlug(name);

    const existing = await findOne({
        model: SubCategoryModel,
        filter: {
            slug,
            category: categoryId,
            ...(excludeId ? { _id: { $ne: excludeId } } : {}),
        },
    });

    if (existing) {
        throw new ConflictException(
            "Subcategory with this name already exists in this category"
        );
    }

    return slug;
};





export const createCategory = async ({ name, isActive }) => {

    const slug = await ensureUniqueCategorySlug(name);

    return create({
        model: CategoryModel,
        data: {
            name,
            slug,
            ...(isActive !== undefined ? { isActive } : {}),
        },
    });
};


export const updateCategory = async (categoryId, inputs) => {

    const update = { ...inputs };

    if (inputs.name) {
        update.slug = await ensureUniqueCategorySlug(inputs.name, categoryId);
    }

    const category = await findOneAndUpdate({
        model: CategoryModel,
        filter: { _id: categoryId },
        update,
    });

    if (!category) {
        throw new NotFoundException("Category not found");
    }

    return category;
};


export const getCategoryById = async (categoryId) => {

    const category = await findById({
        model: CategoryModel,
        id: categoryId,
        options: { populate: [{ path: "subcategories" }] },
    });

    if (!category) {
        throw new NotFoundException("Category not found");
    }

    return category;
};



export const listCategoriesAdmin = async ({ page, size, includeInactive }) => {

    const filter = includeInactive ? {} : { isActive: true };

    return paginate({
        model: CategoryModel,
        filter,
        page,
        size,
        options: {
            sort: { createdAt: -1 },
            populate: [{ path: "subcategories" }],
        },
    });
};


export const deleteCategory = async (categoryId) => {

    const hasSubcategories = await SubCategoryModel.exists({
        category: categoryId,
        isActive: true,
    });

    if (hasSubcategories) {
        throw new BadRequestException(
            "Cannot deactivate a category that still has active subcategories"
        );
    }

    const hasProducts = await ProductModel.exists({
        category: categoryId,
        isDeleted: false,
    });

    if (hasProducts) {
        throw new BadRequestException(
            "Cannot deactivate a category that still has products"
        );
    }

    const category = await findOneAndUpdate({
        model: CategoryModel,
        filter: {
            _id: categoryId,
            isActive: true,
        },
        update: {
            isActive: false,
        },
    });

    if (!category) {
        throw new NotFoundException("Category not found");
    }

    return category;
};

export const getNavbarCategories = async () => {

    return find({
        model: CategoryModel,
        filter: { isActive: true },
        options: {
            sort: { name: 1 },
            populate: [
                {
                    path: "subcategories",
                    match: { isActive: true },
                    options: { sort: { name: 1 } },
                },
            ],
        },
    });
};





export const createSubCategory = async (categoryId, { name, isActive }) => {

    const category = await findById({ model: CategoryModel, id: categoryId });

    if (!category) {
        throw new NotFoundException("Category not found");
    }

    const slug = await ensureUniqueSubCategorySlug(name, categoryId);

    return create({
        model: SubCategoryModel,
        data: {
            name,
            slug,
            category: categoryId,
            ...(isActive !== undefined ? { isActive } : {}),
        },
    });
};


export const updateSubCategory = async (subCategoryId, inputs) => {

    const subCategory = await findById({ model: SubCategoryModel, id: subCategoryId });

    if (!subCategory) {
        throw new NotFoundException("Subcategory not found");
    }

    if (inputs.category) {
        const category = await findById({ model: CategoryModel, id: inputs.category });

        if (!category) {
            throw new NotFoundException("Category not found");
        }
    }

    const targetCategoryId = inputs.category || subCategory.category;

    const update = { ...inputs };

    if (inputs.name) {
        update.slug = await ensureUniqueSubCategorySlug(
            inputs.name,
            targetCategoryId,
            subCategoryId
        );
    }

    return findOneAndUpdate({
        model: SubCategoryModel,
        filter: { _id: subCategoryId },
        update,
    });
};


export const deleteSubCategory = async (subCategoryId) => {

    const hasProducts = await ProductModel.exists({
        subcategory: subCategoryId,
        isDeleted: false,
    });

    if (hasProducts) {
        throw new BadRequestException(
            "Cannot deactivate a subcategory that still has products"
        );
    }

    const subCategory = await findOneAndUpdate({
        model: SubCategoryModel,
        filter: {
            _id: subCategoryId,
            isActive: true,
        },
        update: {
            isActive: false,
        },
    });

    if (!subCategory) {
        throw new NotFoundException("Subcategory not found");
    }

    return subCategory;
};