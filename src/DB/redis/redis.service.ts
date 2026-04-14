import { AppError } from "../../common/utils/globalErrorHandler.js"
import { redis_client } from "./redis.connect.js"

interface SetValueParams {
    key: string
    value: any
    ttl?: number | undefined
};

interface OTPParams {
    email: string
    subject?: string
}

class RedisService {
    private readonly _client = redis_client
    constructor() { }

    // Keys
    revokeKey({ userId, jti }: { userId: string, jti?: string }) {
        return `revoke_token::${userId}::${jti}`;
    }

    getRevokeKey(userId: string) {
        return `revoke_token::${userId}`;
    }

    getProfileKey(userId: string) {
        return `profile::${userId}`;
    }

    otpKey({ email, subject = "confirmEmail" }: OTPParams) {
        return `otp::${subject}::${email}`;
    }

    maxOtpKey({ email, subject = "confirmEmail" }: OTPParams) {
        return `otp_max::${subject}::${email}`;
    }

    blockedOtpKey({ email, subject = "confirmEmail" }: OTPParams) {
        return `otp_blocked::${subject}::${email}`;
    }

    // Methods
    async setValue({ key, value, ttl }: SetValueParams) {
        try {
            const data = typeof value === "string" ? value : JSON.stringify(value);
            return ttl ? await this._client.set(key, data, { EX: ttl }) : await this._client.set(key, data)
        } catch (error) {
            console.error("Error setting value in redis", error);
            throw new AppError('Error setting value in redis', 500);
        }
    }

    async getValue(key: string): Promise<string | null> {
        try {
            const value = await this._client.get(key)
            if (!value) return null

            try {
                return JSON.parse(value)
            } catch {
                return value
            }
        } catch (error) {
            console.error("Error getting value from redis", error);
            throw new AppError('Error getting value from redis', 500);
        }
    }

    async updateValue({ key, value, ttl }: SetValueParams) {
        try {
            const exists = await this.exists(key);
            if (!exists) return;

            return await this.setValue({ key, value, ttl });
        } catch (error) {
            console.error("Error updating value in redis", error);
            throw new AppError('Error updating value in redis', 500);
        }
    }

    async ttl(key: string): Promise<number> {
        try {
            return await this._client.ttl(key);
        } catch (error) {
            console.error("Error getting ttl from redis", error);
            throw new AppError('Error getting ttl from redis', 500);
        }
    }

    async expire({ key, ttl }: { key: string, ttl: number }): Promise<number> {
        try {
            return await this._client.expire(key, ttl);
        } catch (error) {
            console.error("Error setting expire in redis", error);
            throw new AppError('Error setting expire in redis', 500);
        }
    }

    async exists(key: string): Promise<number> {
        try {
            return await this._client.exists(key);
        } catch (error) {
            console.error("Error checking key existence", error);
            throw new AppError('Error checking key existence', 500);
        }
    }

    async del(key: string | string[]): Promise<number> {
        try {
            if (!key || (Array.isArray(key) && key.length === 0)) return 0;
            return await this._client.del(key);
        } catch (error) {
            console.error("Error deleting key", error);
            throw new AppError('Error deleting key', 500);
        }
    }

    async keys(pattern: string): Promise<string[]> {
        try {
            return await this._client.keys(`${pattern}*`);
        } catch (error) {
            console.error("Error getting keys", error);
            throw new AppError('Error getting keys', 500);
        }
    }

    async incr(key: string): Promise<number> {
        try {
            return await this._client.incr(key);
        } catch (error) {
            console.error("Error incrementing value", error);
            throw new AppError('Error incrementing value', 500);
        }
    }
}

export default new RedisService()