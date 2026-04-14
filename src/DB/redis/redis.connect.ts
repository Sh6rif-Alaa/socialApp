import { createClient, RedisClientType } from "redis"
import env from "../../config/config.service";

export const redis_client: RedisClientType = createClient({ url: env.REDIS_URL });

export const redisConnection = async (): Promise<void> => {
    try {
        await redis_client.connect()
        console.log('redis connected Successfully')
    } catch (error) {
        console.log('redis Faild to connect', error)
    }
}