import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')

dotenv.config({ path: envPath })

const port = Number(process.env.PORT) || 3000

export const config = {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  apiPrefix: '/api/v1',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/cozy',
}
