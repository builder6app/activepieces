import { RoleType } from '@activepieces/shared'
import { MigrationInterface, QueryRunner } from 'typeorm'
import { system } from '@server-api/app/helper/system/system'

enum ProjectMemberRole {
    ADMIN = 'ADMIN',
    EDITOR = 'EDITOR',
    OPERATOR = 'OPERATOR',
    VIEWER = 'VIEWER',
}

enum Permission {
    READ_APP_CONNECTION = 'READ_APP_CONNECTION',
    WRITE_APP_CONNECTION = 'WRITE_APP_CONNECTION',
    READ_FLOW = 'READ_FLOW',
    WRITE_FLOW = 'WRITE_FLOW',
    UPDATE_FLOW_STATUS = 'UPDATE_FLOW_STATUS',
    WRITE_INVITATION = 'WRITE_INVITATION',
    READ_INVITATION = 'READ_INVITATION',
    READ_PROJECT_MEMBER = 'READ_PROJECT_MEMBER',
    WRITE_PROJECT_MEMBER = 'WRITE_PROJECT_MEMBER',
    WRITE_GIT_REPO = 'WRITE_GIT_REPO',
    READ_GIT_REPO = 'READ_GIT_REPO',
    READ_RUN = 'READ_RUN',
    WRITE_RUN = 'WRITE_RUN',
    READ_ISSUES = 'READ_ISSUES',
    WRITE_ISSUES = 'WRITE_ISSUES',
    READ_FOLDER = 'READ_FOLDER',
    WRITE_FOLDER = 'WRITE_FOLDER',
    WRITE_ALERT = 'WRITE_ALERT',
    READ_ALERT = 'READ_ALERT',
    WRITE_PROJECT = 'WRITE_PROJECT',
}


const rolePermissions: Record<ProjectMemberRole, Permission[]> = {
    [ProjectMemberRole.ADMIN]: [
        Permission.READ_APP_CONNECTION,
        Permission.WRITE_APP_CONNECTION,
        Permission.READ_FLOW,
        Permission.WRITE_FLOW,
        Permission.UPDATE_FLOW_STATUS,
        Permission.READ_PROJECT_MEMBER,
        Permission.WRITE_PROJECT_MEMBER,
        Permission.WRITE_INVITATION,
        Permission.READ_INVITATION,
        Permission.WRITE_GIT_REPO,
        Permission.READ_GIT_REPO,
        Permission.READ_RUN,
        Permission.WRITE_RUN,
        Permission.READ_ISSUES,
        Permission.WRITE_ISSUES,
        Permission.WRITE_ALERT,
        Permission.READ_ALERT,
        Permission.WRITE_PROJECT,
    ],
    [ProjectMemberRole.EDITOR]: [
        Permission.READ_APP_CONNECTION,
        Permission.WRITE_APP_CONNECTION,
        Permission.READ_FLOW,
        Permission.WRITE_FLOW,
        Permission.UPDATE_FLOW_STATUS,
        Permission.READ_PROJECT_MEMBER,
        Permission.READ_INVITATION,
        Permission.WRITE_GIT_REPO,
        Permission.READ_GIT_REPO,
        Permission.READ_RUN,
        Permission.WRITE_RUN,
        Permission.READ_ISSUES,
        Permission.WRITE_ISSUES,
    ],
    [ProjectMemberRole.OPERATOR]: [
        Permission.READ_APP_CONNECTION,
        Permission.WRITE_APP_CONNECTION,
        Permission.READ_FLOW,
        Permission.UPDATE_FLOW_STATUS,
        Permission.READ_PROJECT_MEMBER,
        Permission.READ_INVITATION,
        Permission.READ_GIT_REPO,
        Permission.READ_RUN,
        Permission.WRITE_RUN,
        Permission.READ_ISSUES,
    ],
    [ProjectMemberRole.VIEWER]: [
        Permission.READ_APP_CONNECTION,
        Permission.READ_FLOW,
        Permission.READ_PROJECT_MEMBER,
        Permission.READ_INVITATION,
        Permission.READ_ISSUES,
    ],
}


const log = system.globalLogger()

export class ReCreateProjectRoleTable1731424289830 implements MigrationInterface {
    name = 'ReCreateProjectRoleTable1731424289830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        log.info({
            name: this.name,
        }, 'Re Creating project_role table')
        

        const projectMemberExists = true; //await queryRunner.hasTable('project_member')

        if (projectMemberExists) {

            await queryRunner.query(`
                ALTER TABLE "project_member" ADD COLUMN "projectRoleId" character varying
        `)

            await queryRunner.query(`
            ALTER TABLE "project_member" 
            ADD CONSTRAINT "fk_project_member_project_role_id" 
            FOREIGN KEY ("projectRoleId") REFERENCES "project_role"("id") ON DELETE CASCADE
        `)

            const projectMembers = await queryRunner.query(`
            SELECT id, role FROM project_member
        `)

            for (const projectMember of projectMembers) {
                const projectRoleIdResult = await queryRunner.query(
                    'SELECT id FROM project_role WHERE name = $1',
                    [projectMember.role],
                )

                const projectRoleId = projectRoleIdResult[0]?.id

                await queryRunner.query(
                    'UPDATE "project_member" SET "projectRoleId" = $1 WHERE id = $2',
                    [projectRoleId, projectMember.id],
                )
            }

            await queryRunner.query(`
            ALTER TABLE "project_member" DROP COLUMN "role"
        `)

            await queryRunner.query(`
            ALTER TABLE "project_member" ALTER COLUMN "projectRoleId" SET NOT NULL
        `)
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
