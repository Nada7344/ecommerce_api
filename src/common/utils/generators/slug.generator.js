import slugify from "slugify";


export const generateSlug = (text = "") => {

    return slugify(text, {
        lower: true,
        strict: true,
        trim: true,
    });
};


export const generateUniqueSuffix = () => {
    return Math.random().toString(36).slice(2, 8);
};