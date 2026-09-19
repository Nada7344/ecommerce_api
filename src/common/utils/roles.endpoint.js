import { RoleEnum } from "../../common/enums/index.js";

export const endpoint = {
    profile: [RoleEnum.User, RoleEnum.Admin],
    adminOnly: [RoleEnum.Admin],
};