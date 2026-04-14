import { EventEmitter } from "node:events";

export const eventEmitter = new EventEmitter()

eventEmitter.on('confirmEmail', async (fn: () => Promise<void>) => {
    await fn()
})