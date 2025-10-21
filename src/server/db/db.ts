import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import postgres from 'postgres'

const dbUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.POSTGRES_DB}`

const client = postgres(dbUrl)
export const db = drizzle(client, { schema, logger: true })