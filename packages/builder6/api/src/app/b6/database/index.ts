import { databaseConnection } from './database-connection'

export async function initializeB6Database({ runMigrations }: { runMigrations: boolean }   ) {
    await databaseConnection().initialize()
    if (runMigrations) {
        await databaseConnection().runMigrations()
    }
}