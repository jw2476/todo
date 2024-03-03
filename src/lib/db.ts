import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';


const migrationClient = postgres(DATABASE_URL, { max: 1 });
migrate(drizzle(migrationClient), { migrationsFolder: "./drizzle" });

const client =  postgres(DATABASE_URL) 
export const db = drizzle(client, { schema });

