import joi from "joi";
import { ReportGroupByEnum } from "../../common/enums/index.js";


const dateRange = {
    from: joi.date(),
    to: joi.date().min(joi.ref("from")),
};


export const dateRangeQuery = {
    query: joi.object().keys({
        ...dateRange,
    }),
};


export const salesReport = {
    query: joi.object().keys({
        ...dateRange,
        groupBy: joi.string().valid(...Object.values(ReportGroupByEnum)),
    }),
};


export const topProducts = {
    query: joi.object().keys({
        ...dateRange,
        limit: joi.number().integer().min(1).max(50),
    }),
};


export const newUsersReport = {
    query: joi.object().keys({
        ...dateRange,
        groupBy: joi.string().valid(...Object.values(ReportGroupByEnum)),
    }),
};
