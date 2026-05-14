import { resolve } from 'path'
import { config } from 'dotenv'

const NODE_ENV = process.env.NODE_ENV
config({ path: resolve(`.env.${NODE_ENV}`) })

const env = {
    PORT: process.env.PORT!,
    DB_URI: process.env.DB_URI!,
    TOKEN_KEY: process.env.TOKEN_KEY!,
    REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY!,
    ENCRYPT_KEY: process.env.ENCRYPT_KEY!,
    ENCRYPT_ALGORITHM: process.env.ENCRYPT_ALGORITHM!,
    SALT_ROUNDS: process.env.SALT_ROUNDS!,
    PREFIX: process.env.PREFIX!,
    EMAIL: process.env.EMAIL!,
    PASSWORD: process.env.PASSWORD!,
    REDIS_URL: process.env.REDIS_URL!,
    CLIENT_ID: process.env.CLIENT_ID!,
    AWS_REGION: process.env.AWS_REGION!,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME!,
    AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY!,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
    SERVICE_ACCOUNT_KEY: process.env.SERVICE_ACCOUNT_KEY!
}

export default env