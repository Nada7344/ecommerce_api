import { EventEmitter } from "node:events";

export const emailEvent = new EventEmitter();

emailEvent.on("SendEmail", async (fn) => {
    try {
        await fn();
    } catch (error) {
        console.error(`Fail in email event: ${error.message}`);
    }
});