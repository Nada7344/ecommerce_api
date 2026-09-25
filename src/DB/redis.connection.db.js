import { createClient } from "redis";
import { REDIS_URI } from "../../config/config.service.js";

export const redisClient = createClient({
    url: REDIS_URI,
    pingInterval: 30000,
    socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
            if (retries > 10) return new Error("Redis: too many retries, giving up");
            return Math.min(retries * 200, 3000);
        },
    },
});

redisClient.on("error", (error) => {
    console.error("Redis Client Error:", error);
});

export const connectRedis = async () => {
    try {

        await redisClient.connect();

        console.log("Redis_DB connected");

    } catch (error) {

        console.error(
            `Fail to connect on Redis_DB: ${error.message}`
        );

        process.exit(1);
    }
};