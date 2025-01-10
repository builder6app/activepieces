import { ApEdition, ApEnvironment, isNil } from '@activepieces/shared'
import {
    ArrayContains,
    DataSource,
    EntitySchema,
    FindOperator,
    Raw,
} from 'typeorm'
import { DatabaseType, system } from '@server-api/app/helper/system/system'
import { AppSystemProp } from '@server-api/app/helper/system/system-prop'
import { ProjectEntity } from '@server-api/app/project/project-entity'

import { PlatformEntity } from '../platform/platform.entity'
import { ProjectMemberEntity } from '../project-members/project-member.entity'
import { createPostgresDataSource } from './postgres-connection'
import { createSqlLiteDataSource } from '@server-api/app/database/sqlite-connection'

const databaseType = system.get(AppSystemProp.DB_TYPE)

function getEntities(): EntitySchema<unknown>[] {
    const edition = system.getEdition()

    const entities: EntitySchema[] = [
        PlatformEntity,
        ProjectEntity,
        ProjectMemberEntity,
    ]

    switch (edition) {
        case ApEdition.CLOUD:
        case ApEdition.ENTERPRISE:
            break
        case ApEdition.COMMUNITY:
            break
        default:
            throw new Error(`Unsupported edition: ${edition}`)
    }

    return entities
}

const getSynchronize = (): boolean => {
    const env = system.getOrThrow<ApEnvironment>(AppSystemProp.ENVIRONMENT)

    const value: Partial<Record<ApEnvironment, boolean>> = {
        [ApEnvironment.TESTING]: true,
    }

    return value[env] ?? false
}

export const commonProperties = {
    subscribers: [],
    entities: getEntities(),
    synchronize: getSynchronize(),
}

let _databaseConnection: DataSource | null = null

export const databaseConnection = () => {
    if (isNil(_databaseConnection)) {
        _databaseConnection = databaseType === DatabaseType.SQLITE3
            ? createSqlLiteDataSource()
            : createPostgresDataSource()
    }
    return _databaseConnection
}

export function APArrayContains<T>(
    columnName: string,
    values: string[],
): FindOperator<T> {
    const databaseType = system.get(AppSystemProp.DB_TYPE)
    switch (databaseType) {
        case DatabaseType.POSTGRES:
            return ArrayContains(values)
        case DatabaseType.SQLITE3: {
            const likeConditions = values
                .map((_, index) => `${columnName} LIKE :value${index}`)
                .join(' AND ')
            const likeParams = values.reduce((params, value, index) => {
                params[`value${index}`] = `%${value}%`
                return params
            }, {} as Record<string, string>)
            return Raw(_ => `(${likeConditions})`, likeParams)
        }
        default:
            throw new Error(`Unsupported database type: ${databaseType}`)
    }
}

// Uncomment the below line when running `nx db-migration server-api name=<MIGRATION_NAME>` and recomment it after the migration is generated
// export const exportedConnection = databaseConnection()