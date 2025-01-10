import { TlsOptions } from 'node:tls'
import { ApEdition, ApEnvironment, isNil } from '@activepieces/shared'
import { DataSource, MigrationInterface } from 'typeorm'
import { AddProjectMembers1689177797092 } from './migrations/postgres/1689177797092-AddProjectMembers'
import { ProjectMemberRelations1694381968985 } from './migrations/postgres/1694381968985-project-member-relations'

import { ModifyProjectMembersAndRemoveUserId1701647565290 } from './migrations/postgres/1701647565290-ModifyProjectMembersAndRemoveUserId'
import { ModifyProjectMembers1717961669938 } from './migrations/postgres/1717961669938-ModifyProjectMembers'

import { system } from '@server-api/app/helper/system/system'
import { AppSystemProp } from '@server-api/app/helper/system/system-prop'
import { commonProperties } from '@server-api/app/database/database-connection'

const getSslConfig = (): boolean | TlsOptions => {
    const useSsl = system.get(AppSystemProp.POSTGRES_USE_SSL)
    if (useSsl === 'true') {
        return {
            ca: system.get(AppSystemProp.POSTGRES_SSL_CA)?.replace(/\\n/g, '\n'),
        }
    }
    return false
}

const getMigrations = (): (new () => MigrationInterface)[] => {
    const commonMigration = [
    ]

    const edition = system.getEdition()
    switch (edition) {
        case ApEdition.CLOUD:
        case ApEdition.ENTERPRISE:
            break
        case ApEdition.COMMUNITY:
            commonMigration.push(

                // Builder6
                AddProjectMembers1689177797092,
                ProjectMemberRelations1694381968985,
                ModifyProjectMembersAndRemoveUserId1701647565290,
                ModifyProjectMembers1717961669938,
                
            )
            break
    }

    return commonMigration
}

const getMigrationConfig = (): MigrationConfig => {
    const env = system.getOrThrow<ApEnvironment>(AppSystemProp.ENVIRONMENT)

    if (env === ApEnvironment.TESTING) {
        return {}
    }

    return {
        migrationsRun: true,
        migrationsTransactionMode: 'each',
        migrations: getMigrations(),
    }
}

export const createPostgresDataSource = (): DataSource => {
    const migrationConfig = getMigrationConfig()
    const url = system.get(AppSystemProp.POSTGRES_URL)

    if (!isNil(url)) {
        return new DataSource({
            type: 'postgres',
            url,
            ssl: getSslConfig(),
            ...migrationConfig,
            ...commonProperties,
        })
    }

    const database = system.getOrThrow(AppSystemProp.POSTGRES_DATABASE)
    const host = system.getOrThrow(AppSystemProp.POSTGRES_HOST)
    const password = system.getOrThrow(AppSystemProp.POSTGRES_PASSWORD)
    const serializedPort = system.getOrThrow(AppSystemProp.POSTGRES_PORT)
    const port = Number.parseInt(serializedPort, 10)
    const username = system.getOrThrow(AppSystemProp.POSTGRES_USERNAME)

    return new DataSource({
        type: 'postgres',
        host,
        port,
        username,
        password,
        database,
        ssl: getSslConfig(),
        ...migrationConfig,
        ...commonProperties,
    })
}

type MigrationConfig = {
    migrationsRun?: boolean
    migrationsTransactionMode?: 'all' | 'none' | 'each'
    migrations?: (new () => MigrationInterface)[]
}
