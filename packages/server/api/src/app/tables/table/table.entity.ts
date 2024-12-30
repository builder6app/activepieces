import { Field, Project, Record, Table } from '@activepieces/shared'
import { EntitySchema } from 'typeorm'
import { ApIdSchema, BaseColumnSchemaPart } from '../../database/database-common'

type TableSchema = Table & {
    project: Project
    fields: Field[]
    records: Record[]
}

export const TableEntity = new EntitySchema<TableSchema>({
    name: 'table',
    columns: {
        ...BaseColumnSchemaPart,
        name: {
            type: String,
        },
        projectId: {
            ...ApIdSchema,
            nullable: false,
        },
    },
    indices: [  
        {
            name: 'idx_table_project_id_name_unique',
            columns: ['projectId', 'name'],
            unique: true,
        },
    ],
    relations: {
        project: {
            type: 'many-to-one',
            target: 'project',
            cascade: true,
            onDelete: 'CASCADE',
            joinColumn: {
                name: 'projectId',
                foreignKeyConstraintName: 'fk_table_project_id',
            },
        },
        fields: {
            type: 'one-to-many',
            target: 'field',
            inverseSide: 'table',
        },
        records: {
            type: 'one-to-many',
            target: 'record',
            inverseSide: 'table',
        },
    },
})