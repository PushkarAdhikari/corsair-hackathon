import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./db/schema";

const localUrl = "postgresql://postgres:a1sNDTcxsEdpHEZ4@localhost:5432/corsair-ai";
const neonUrl = "postgresql://neondb_owner:npg_W3EnjBMc1ZyF@ep-square-math-aot6xu3t-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function runSync() {
  console.log("Connecting to databases...");
  const localSql = postgres(localUrl);
  const localDb = drizzle(localSql, { schema });

  const neonSql = postgres(neonUrl);
  const neonDb = drizzle(neonSql, { schema });

  try {
    // 1. Sync Integrations
    console.log("Fetching local integrations...");
    const integrations = await localDb.select().from(schema.corsairIntegrations);
    console.log(`Found ${integrations.length} integrations.`);

    if (integrations.length > 0) {
      console.log("Inserting integrations into Neon...");
      for (const row of integrations) {
        await neonDb.insert(schema.corsairIntegrations)
          .values(row)
          .onConflictDoUpdate({
            target: schema.corsairIntegrations.id,
            set: row,
          });
      }
      console.log("Integrations synced successfully.");
    }

    // 2. Sync Accounts
    console.log("Fetching local accounts...");
    const accounts = await localDb.select().from(schema.corsairAccounts);
    console.log(`Found ${accounts.length} accounts.`);

    if (accounts.length > 0) {
      console.log("Inserting accounts into Neon...");
      for (const row of accounts) {
        await neonDb.insert(schema.corsairAccounts)
          .values(row)
          .onConflictDoUpdate({
            target: schema.corsairAccounts.id,
            set: row,
          });
      }
      console.log("Accounts synced successfully.");
    }

    // 3. Sync Entities
    console.log("Fetching local entities...");
    const entities = await localDb.select().from(schema.corsairEntities);
    console.log(`Found ${entities.length} entities.`);

    if (entities.length > 0) {
      console.log("Inserting entities into Neon...");
      // Insert in chunks of 50 to avoid parameter limit issues
      const chunkSize = 50;
      for (let i = 0; i < entities.length; i += chunkSize) {
        const chunk = entities.slice(i, i + chunkSize);
        for (const row of chunk) {
          await neonDb.insert(schema.corsairEntities)
            .values(row)
            .onConflictDoUpdate({
              target: schema.corsairEntities.id,
              set: row,
            });
        }
      }
      console.log("Entities synced successfully.");
    }

    console.log("All data successfully synchronized to Neon DB!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await localSql.end();
    await neonSql.end();
  }
}

void runSync();
