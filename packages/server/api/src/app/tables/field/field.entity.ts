import { Cell, Field, FieldType, Project, Table } from '@activepieces/shared'
import { EntitySchema } from 'typeorm'
import { ApIdSchema, BaseColumnSchemaPart } from '../../database/database-common'

type FieldSchema = Field & {
    table: Table
    project: Project
    cells: Cell[]
}

export const FieldEntity = new EntitySchema<FieldSchema>({
    name: 'field',
    columns: {
        ...BaseColumnSchemaPart,
        name: {
            type: String,
        },
        type: {
            type: String,
            enum: FieldType,
        },
        tableId: {
            ...ApIdSchema,
            nullable: false,
        },
        projectId: {
            ...ApIdSchema,
            nullable: false,
        },
    },
    indices: [
        {
            name: 'idx_field_project_id_table_id_name_unique',
            columns: ['projectId', 'tableId', 'name'],
            unique: true,
        },
    ],
    relations: {
        table: {
            type: 'many-to-one',
            target: 'table',
            cascade: true,
            onDelete: 'CASCADE',
            joinColumn: {
                name: 'tableId',
                foreignKeyConstraintName: 'fk_field_table_id',
            },
        },
        project: {
            type: 'many-to-one',
            target: 'project',
            cascade: true,
            onDelete: 'CASCADE',
            joinColumn: {
                name: 'projectId',
                foreignKeyConstraintName: 'fk_field_project_id',
            },
        },
        cells: {
            type: 'one-to-many',
            target: 'cell',
            inverseSide: 'field',
        },
    },
})