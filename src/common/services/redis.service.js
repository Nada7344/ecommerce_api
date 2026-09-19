import { redisClient } from "../../DB/redis.connection.db.js";
import { SubjectEnum } from "../enums/email.enum.js";


//keys

export const revokeTokenKey = ({
    userId,
    jti,
} = {}) => {

    return `user:RevokeToken:${userId}:${jti}`;
};


export const revokeTokenKeyPrefix = ({
    userId,
} = {}) => {

    return `user:RevokeToken:${userId}:`;
};


export const otpKey = ({
    email,
    subject = SubjectEnum.ConfirmEmail,
} = {}) => {

    return `OTP::User::${email}::${subject}`;
};


export const maxAttempOtpKey = ({
    email,
    subject = SubjectEnum.ConfirmEmail,
} = {}) => {

    return `${otpKey({
        email,
        subject,
    })}::MaxTrial`;
};


export const blockOtpKey = ({
    email,
    subject = SubjectEnum.ConfirmEmail,
} = {}) => {

    return `${otpKey({
        email,
        subject,
    })}::Block`;
};






export const set = async ({
    key,
    value,
    ttl,
} = {}) => {

    try {

        const data =
            typeof value === "string"
                ? value
                : JSON.stringify(value);


        if (ttl) {

            return await redisClient.set(
                key,
                data,
                {
                    EX: ttl,
                }
            );
        }


        return await redisClient.set(
            key,
            data
        );

    } catch (error) {

        console.error(
            `Fail in Redis SET operation: ${error.message}`
        );

        throw error;
    }
};






export const update = async ({
    key,
    value,
    ttl,
} = {}) => {

    try {

        const exists =
            await redisClient.exists(key);


        if (!exists) {
            return false;
        }


        const data =
            typeof value === "string"
                ? value
                : JSON.stringify(value);


        if (ttl) {

            return await redisClient.set(
                key,
                data,
                {
                    EX: ttl,
                }
            );
        }


        return await redisClient.set(
            key,
            data
        );

    } catch (error) {

        console.error(
            `Fail in Redis UPDATE operation: ${error.message}`
        );

        throw error;
    }
};






export const get = async ({
    key,
} = {}) => {

    try {

        const data =
            await redisClient.get(key);


        if (!data) {
            return null;
        }


        try {

            return JSON.parse(data);

        } catch {

            return data;
        }

    } catch (error) {

        console.error(
            `Fail in Redis GET operation: ${error.message}`
        );

        throw error;
    }
};





export const mGet = async ({
    keys = [],
} = {}) => {

    try {

        if (!keys.length) {
            return [];
        }


        return await redisClient.mGet(keys);

    } catch (error) {

        console.error(
            `Fail in Redis MGET operation: ${error.message}`
        );

        throw error;
    }
};






export const ttl = async ({
    key,
} = {}) => {

    try {

        return await redisClient.ttl(key);

    } catch (error) {

        console.error(
            `Fail in Redis TTL operation: ${error.message}`
        );

        throw error;
    }
};






export const exists = async ({
    key,
} = {}) => {

    try {

        return await redisClient.exists(key);

    } catch (error) {

        console.error(
            `Fail in Redis EXISTS operation: ${error.message}`
        );

        throw error;
    }
};





export const incr = async ({
    key,
} = {}) => {

    try {

        return await redisClient.incr(key);

    } catch (error) {

        console.error(
            `Fail in Redis INCR operation: ${error.message}`
        );

        throw error;
    }
};





export const expire = async ({
    key,
    ttl,
} = {}) => {

    try {

        return await redisClient.expire(
            key,
            ttl
        );

    } catch (error) {

        console.error(
            `Fail in Redis EXPIRE operation: ${error.message}`
        );

        throw error;
    }
};





export const allKeysByPrefix = async (
    prefix
) => {

    try {

        return await redisClient.keys(
            `${prefix}*`
        );

    } catch (error) {

        console.error(
            `Fail in Redis KEYS operation: ${error.message}`
        );

        throw error;
    }
};






export const deleteKey = async ({
    key,
} = {}) => {

    try {

        if (!key) {
            return 0;
        }


        return await redisClient.del(key);

    } catch (error) {

        console.error(
            `Fail in Redis DELETE operation: ${error.message}`
        );

        throw error;
    }
};