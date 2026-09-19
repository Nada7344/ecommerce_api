import { resolve } from 'node:path'
import { config } from 'dotenv'

export const NODE_ENV = process.env.NODE_ENV

const envPath = {
    development: `.env.development`,
    production: `.env.production`,
}



config({ path: resolve(`./config/${envPath[NODE_ENV]}`) })


export const port = process.env.PORT ?? 5000
export const APPLICATION_NAME = process.env.APPLICATION_NAME

export const DB_URI = process.env.DB_URI 
export const REDIS_URI = process.env.REDIS_URI

export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')


export const USER_ACCESS_TOKEN_SECRET_KEY = process.env.USER_ACCESS_TOKEN_SECRET_KEY
export const USER_REFRESH_TOKEN_SECRET_KEY = process.env.USER_REFRESH_TOKEN_SECRET_KEY

export const SYSTEM_ACCESS_TOKEN_SECRET_KEY = process.env.SYSTEM_ACCESS_TOKEN_SECRET_KEY
export const SYSTEM_REFRESH_TOKEN_SECRET_KEY = process.env.SYSTEM_REFRESH_TOKEN_SECRET_KEY

export const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)
export const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN)

export const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD
export const EMAIL = process.env.EMAIL

export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '').split(',').map(origin => origin.trim())||[]
    

export const CLOUD_NAME = process.env.CLOUD_NAME
export const CLOUD_API_KEY = process.env.CLOUD_API_KEY
export const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET