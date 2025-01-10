import { ApplicationEventName, AuthenticationEvent, ConnectionEvent, FlowCreatedEvent, FlowDeletedEvent, FlowRunEvent, FolderEvent, GitRepoWithoutSensitiveData, ProjectMember, ProjectReleaseEvent, ProjectRoleEvent, SigningKeyEvent, SignUpEvent } from '@activepieces/ee-shared'
import { PieceMetadata } from '@activepieces/pieces-framework'
import { exceptionHandler, rejectedPromiseHandler, WorkerSystemProp } from '@activepieces/server-shared'
import { ApEdition, ApEnvironment, AppConnectionWithoutSensitiveData, Flow, FlowRun, FlowTemplate, Folder, isNil, ProjectRelease, ProjectWithLimits, spreadIfDefined, UserInvitation } from '@activepieces/shared'
import swagger from '@fastify/swagger'
import { createAdapter } from '@socket.io/redis-adapter'
import { FastifyInstance, FastifyRequest, HTTPMethods } from 'fastify'
import fastifySocketIO from 'fastify-socket.io'
import { Socket } from 'socket.io'
import { aiProviderModule } from '@server-api/app/ai/ai-provider.module'
import { setPlatformOAuthService } from '@server-api/app/app-connection/app-connection-service/oauth2'
import { appConnectionModule } from '@server-api/app/app-connection/app-connection.module'
import { appEventRoutingModule } from '@server-api/app/app-event-routing/app-event-routing.module'
import { authenticationServiceHooks } from '@server-api/app/authentication/authentication-service/hooks'
import { authenticationModule } from '@server-api/app/authentication/authentication.module'
import { accessTokenManager } from '@server-api/app/authentication/lib/access-token-manager'
import { copilotModule } from '@server-api/app/copilot/copilot.module'
import { rateLimitModule } from '@server-api/app/core/security/rate-limit'
import { securityHandlerChain } from '@server-api/app/core/security/security-handler-chain'
import { getRedisConnection } from '@server-api/app/database/redis-connection'
import { alertsModule } from '@server-api/app/ee/alerts/alerts-module'
import { analyticsModule } from '@server-api/app/ee/analytics/analytics.module'
import { apiKeyModule } from '@server-api/app/ee/api-keys/api-key-module'
import { platformOAuth2Service } from '@server-api/app/ee/app-connections/platform-oauth2-service'
import { appCredentialModule } from '@server-api/app/ee/app-credentials/app-credentials.module'
import { auditEventModule } from '@server-api/app/ee/audit-logs/audit-event-module'
import { auditLogService } from '@server-api/app/ee/audit-logs/audit-event-service'
import { cloudAuthenticationServiceHooks } from '@server-api/app/ee/authentication/authentication-service/hooks/cloud-authentication-service-hooks'
import { enterpriseAuthenticationServiceHooks } from '@server-api/app/ee/authentication/authentication-service/hooks/enterprise-authentication-service-hooks'
import { enterpriseLocalAuthnModule } from '@server-api/app/ee/authentication/enterprise-local-authn/enterprise-local-authn-module'
import { federatedAuthModule } from '@server-api/app/ee/authentication/federated-authn/federated-authn-module'
import { rbacMiddleware } from '@server-api/app/ee/authentication/project-role/rbac-middleware'
import { authnSsoSamlModule } from '@server-api/app/ee/authentication/saml-authn/authn-sso-saml-module'
import { appSumoModule } from '@server-api/app/ee/billing/appsumo/appsumo.module'
import { projectBillingModule } from '@server-api/app/ee/billing/project-billing/project-billing.module'
import { connectionKeyModule } from '@server-api/app/ee/connection-keys/connection-key.module'
import { customDomainModule } from '@server-api/app/ee/custom-domains/custom-domain.module'
import { enterpriseFlagsHooks } from '@server-api/app/ee/flags/enterprise-flags.hooks'
import { platformRunHooks } from '@server-api/app/ee/flow-run/cloud-flow-run-hooks'
import { platformFlowTemplateModule } from '@server-api/app/ee/flow-template/platform-flow-template.module'
import { globalConnectionModule } from '@server-api/app/ee/global-connections/global-connection-module'
import { emailService } from '@server-api/app/ee/helper/email/email-service'
import { platformDomainHelper } from '@server-api/app/ee/helper/platform-domain-helper'
import { issuesModule } from '@server-api/app/ee/issues/issues-module'
import { licenseKeysModule } from '@server-api/app/ee/license-keys/license-keys-module'
import { managedAuthnModule } from '@server-api/app/ee/managed-authn/managed-authn-module'
import { oauthAppModule } from '@server-api/app/ee/oauth-apps/oauth-app.module'
import { otpModule } from '@server-api/app/ee/otp/otp-module'
import { adminPieceModule } from '@server-api/app/ee/pieces/admin-piece-module'
import { enterprisePieceMetadataServiceHooks } from '@server-api/app/ee/pieces/filters/enterprise-piece-metadata-service-hooks'
import { platformPieceModule } from '@server-api/app/ee/pieces/platform-piece-module'
import { adminPlatformPieceModule } from '@server-api/app/ee/platform/admin-platform.controller'
import { projectMemberModule } from './b6/project-members/project-member.module'
import { gitRepoModule } from '@server-api/app/ee/project-release/git-sync/git-sync.module'
import { projectReleaseModule } from '@server-api/app/ee/project-release/project-release.module'
import { projectRoleModule } from '@server-api/app/ee/project-role/project-role.module'
import { projectEnterpriseHooks } from '@server-api/app/ee/projects/ee-project-hooks'
import { platformProjectModule } from './b6//projects/platform-project-module'
import { signingKeyModule } from '@server-api/app/ee/signing-key/signing-key-module'
import { usageTrackerModule } from '@server-api/app/ee/usage-tracker/usage-tracker-module'
import { fileModule } from '@server-api/app/file/file.module'
import { flagModule } from './flags/flag.module'
import { flagHooks } from './flags/flags.hooks'
import { communityFlowTemplateModule } from '@server-api/app/flow-templates/community-flow-template.module'
import { humanInputModule } from '@server-api/app/flows/flow/human-input/human-input.module'
import { flowRunHooks } from '@server-api/app/flows/flow-run/flow-run-hooks'
import { flowRunModule } from '@server-api/app/flows/flow-run/flow-run-module'
import { flowModule } from '@server-api/app/flows/flow.module'
import { folderModule } from '@server-api/app/flows/folder/folder.module'
import { triggerEventModule } from '@server-api/app/flows/trigger-events/trigger-event.module'
import { eventsHooks } from '@server-api/app/helper/application-events'
import { domainHelper } from '@server-api/app/helper/domain-helper'
import { openapiModule } from '@server-api/app/helper/openapi/openapi.module'
import { QueueMode, system } from '@server-api/app/helper/system/system'
import { AppSystemProp } from '@server-api/app/helper/system/system-prop'
import { systemJobsSchedule } from '@server-api/app/helper/system-jobs'
import { SystemJobName } from '@server-api/app/helper/system-jobs/common'
import { systemJobHandlers } from '@server-api/app/helper/system-jobs/job-handlers'
import { validateEnvPropsOnStartup } from '@server-api/app/helper/system-validator'
import { pieceModule } from '@server-api/app/pieces/base-piece-module'
import { communityPiecesModule } from '@server-api/app/pieces/community-piece-module'
import { pieceMetadataServiceHooks } from '@server-api/app/pieces/piece-metadata-service/hooks'
import { pieceSyncService } from '@server-api/app/pieces/piece-sync-service'
import { platformModule } from './b6/platform/platform.module'
import { platformService } from '@server-api/app/platform/platform.service'
import { projectHooks } from '@server-api/app/project/project-hooks'
import { projectModule } from '@server-api/app/project/project-module'
import { storeEntryModule } from '@server-api/app/store-entry/store-entry.module'
import { tagsModule } from '@server-api/app/tags/tags-module'
import { platformUserModule } from '@server-api/app/user/platform/platform-user-module'
import { invitationModule } from '@server-api/app/user-invitations/user-invitation.module'
import { webhookModule } from '@server-api/app/webhooks/webhook-module'
import { websocketService } from '@server-api/app/websockets/websockets.service'
import { flowConsumer } from '@server-api/app/workers/consumer'
import { engineResponseWatcher } from '@server-api/app/workers/engine-response-watcher'
import { workerModule } from '@server-api/app/workers/worker-module'

export const setupApp = async (app: FastifyInstance): Promise<FastifyInstance> => {

    await app.register(swagger, {
        hideUntagged: true,
        openapi: {
            servers: [
                {
                    url: 'https://cloud.activepieces.com/api',
                    description: 'Production Server',
                },
            ],
            components: {
                securitySchemes: {
                    apiKey: {
                        type: 'http',
                        description: 'Use your api key generated from the admin console',
                        scheme: 'bearer',
                    },
                },
                schemas: {
                    [ApplicationEventName.FLOW_CREATED]: FlowCreatedEvent,
                    [ApplicationEventName.FLOW_DELETED]: FlowDeletedEvent,
                    [ApplicationEventName.CONNECTION_UPSERTED]: ConnectionEvent,
                    [ApplicationEventName.CONNECTION_DELETED]: ConnectionEvent,
                    [ApplicationEventName.FOLDER_CREATED]: FolderEvent,
                    [ApplicationEventName.FOLDER_UPDATED]: FolderEvent,
                    [ApplicationEventName.FOLDER_DELETED]: FolderEvent,
                    [ApplicationEventName.FLOW_RUN_STARTED]: FlowRunEvent,
                    [ApplicationEventName.FLOW_RUN_FINISHED]: FlowRunEvent,
                    [ApplicationEventName.USER_SIGNED_UP]: SignUpEvent,
                    [ApplicationEventName.USER_SIGNED_IN]: AuthenticationEvent,
                    [ApplicationEventName.USER_PASSWORD_RESET]: AuthenticationEvent,
                    [ApplicationEventName.USER_EMAIL_VERIFIED]: AuthenticationEvent,
                    [ApplicationEventName.SIGNING_KEY_CREATED]: SigningKeyEvent,
                    [ApplicationEventName.PROJECT_ROLE_CREATED]: ProjectRoleEvent,
                    [ApplicationEventName.PROJECT_RELEASE_CREATED]: ProjectReleaseEvent,
                    'flow-template': FlowTemplate,
                    'folder': Folder,
                    'user-invitation': UserInvitation,
                    'project-member': ProjectMember,
                    project: ProjectWithLimits,
                    flow: Flow,
                    'flow-run': FlowRun,
                    'app-connection': AppConnectionWithoutSensitiveData,
                    piece: PieceMetadata,
                    'git-repo': GitRepoWithoutSensitiveData,
                    'project-release': ProjectRelease,
                },
            },
            info: {
                title: 'Activepieces Documentation',
                version: '0.0.0',
            },
            externalDocs: {
                url: 'https://www.activepieces.com/docs',
                description: 'Find more info here',
            },
        },
    })


    await app.register(rateLimitModule)

    await app.register(fastifySocketIO, {
        cors: {
            origin: '*',
        },
        ...spreadIfDefined('adapter', await getAdapter()),
        transports: ['websocket'],
    })

    app.io.use((socket: Socket, next: (err?: Error) => void) => {
        accessTokenManager
            .verifyPrincipal(socket.handshake.auth.token)
            .then(() => {
                next()
            })
            .catch(() => {
                next(new Error('Authentication error'))
            })
    })

    app.io.on('connection', (socket: Socket) => {
        rejectedPromiseHandler(websocketService.init(socket, app.log), app.log)
    })

    app.addHook('onResponse', async (request, reply) => {
        // eslint-disable-next-line
        reply.header('x-request-id', request.id)
    })
    app.addHook('onRequest', async (request, reply) => {
        const route = app.hasRoute({
            method: request.method as HTTPMethods,
            url: request.url,
        })
        if (!route) {
            return reply.code(404).send({
                statusCode: 404,
                error: 'Not Found',
                message: 'Route not found',
            })
        }
    })

    app.addHook('preHandler', securityHandlerChain)
    app.addHook('preHandler', rbacMiddleware)
    await systemJobsSchedule(app.log).init()
    await app.register(fileModule)
    await app.register(flagModule)
    await app.register(storeEntryModule)
    await app.register(folderModule)
    await app.register(flowModule)
    await app.register(pieceModule)
    await app.register(flowRunModule)
    await app.register(webhookModule)
    await app.register(appConnectionModule)
    await app.register(openapiModule)
    await app.register(triggerEventModule)
    await app.register(appEventRoutingModule)
    await app.register(authenticationModule)
    await app.register(copilotModule),
    await app.register(platformModule)
    await app.register(humanInputModule)
    await app.register(tagsModule)
    await pieceSyncService(app.log).setup()
    await app.register(platformUserModule)
    await app.register(issuesModule)
    await app.register(authnSsoSamlModule)
    await app.register(alertsModule)
    await app.register(invitationModule)
    await app.register(workerModule)
    await app.register(aiProviderModule)
    await app.register(licenseKeysModule)

    app.get(
        '/redirect',
        async (
            request: FastifyRequest<{ Querystring: { code: string } }>,
            reply,
        ) => {
            const params = {
                code: request.query.code,
            }
            if (!params.code) {
                return reply.send('The code is missing in url')
            }
            else {
                return reply
                    .type('text/html')
                    .send(
                        `<script>if(window.opener){window.opener.postMessage({ 'code': '${encodeURIComponent(
                            params.code,
                        )}' },'*')}</script> <html>Redirect succuesfully, this window should close now</html>`,
                    )
            }
        },
    )

    await validateEnvPropsOnStartup(app.log)

    const edition = system.getEdition()
    app.log.info({
        edition,
    }, 'Activepieces Edition')
    switch (edition) {
        case ApEdition.CLOUD:
            await app.register(appCredentialModule)
            await app.register(connectionKeyModule)
            await app.register(platformProjectModule)
            await app.register(projectMemberModule)
            await app.register(appSumoModule)
            await app.register(adminPieceModule)
            await app.register(customDomainModule)
            await app.register(signingKeyModule)
            await app.register(managedAuthnModule)
            await app.register(oauthAppModule)
            await app.register(platformPieceModule)
            await app.register(otpModule)
            await app.register(enterpriseLocalAuthnModule)
            await app.register(federatedAuthModule)
            await app.register(apiKeyModule)
            await app.register(platformFlowTemplateModule)
            await app.register(gitRepoModule)
            await app.register(auditEventModule)
            await app.register(usageTrackerModule)
            await app.register(adminPlatformPieceModule)
            await app.register(analyticsModule)
            await app.register(projectBillingModule)
            await app.register(projectRoleModule)
            await app.register(projectReleaseModule)
            await app.register(globalConnectionModule)
            setPlatformOAuthService(platformOAuth2Service(app.log))
            projectHooks.set(projectEnterpriseHooks)
            eventsHooks.set(auditLogService)
            flowRunHooks.set(platformRunHooks)
            flagHooks.set(enterpriseFlagsHooks)
            pieceMetadataServiceHooks.set(enterprisePieceMetadataServiceHooks)
            authenticationServiceHooks.set(cloudAuthenticationServiceHooks)
            domainHelper.set(platformDomainHelper)
            systemJobHandlers.registerJobHandler(SystemJobName.ISSUES_REMINDER, emailService(app.log).sendReminderJobHandler)
            exceptionHandler.initializeSentry(system.get(AppSystemProp.SENTRY_DSN))
            break
        case ApEdition.ENTERPRISE:
            await app.register(customDomainModule)
            await app.register(platformProjectModule)
            await app.register(projectMemberModule)
            await app.register(signingKeyModule)
            await app.register(managedAuthnModule)
            await app.register(oauthAppModule)
            await app.register(platformPieceModule)
            await app.register(otpModule)
            await app.register(enterpriseLocalAuthnModule)
            await app.register(federatedAuthModule)
            await app.register(apiKeyModule)
            await app.register(platformFlowTemplateModule)
            await app.register(gitRepoModule)
            await app.register(auditEventModule)
            await app.register(usageTrackerModule)
            await app.register(analyticsModule)
            await app.register(projectRoleModule)
            await app.register(projectReleaseModule)
            await app.register(globalConnectionModule)
            systemJobHandlers.registerJobHandler(SystemJobName.ISSUES_REMINDER, emailService(app.log).sendReminderJobHandler)
            setPlatformOAuthService(platformOAuth2Service(app.log))
            projectHooks.set(projectEnterpriseHooks)
            eventsHooks.set(auditLogService)
            flowRunHooks.set(platformRunHooks)
            authenticationServiceHooks.set(enterpriseAuthenticationServiceHooks)
            pieceMetadataServiceHooks.set(enterprisePieceMetadataServiceHooks)
            flagHooks.set(enterpriseFlagsHooks)
            domainHelper.set(platformDomainHelper)
            break
        case ApEdition.COMMUNITY:
            await app.register(platformProjectModule)
            await app.register(projectMemberModule)
            // await app.register(projectModule)
            await app.register(communityPiecesModule)
            await app.register(communityFlowTemplateModule)
            break
    }

    app.addHook('onClose', async () => {
        app.log.info('Shutting down')
        await flowConsumer(app.log).close()
        await systemJobsSchedule(app.log).close()
        await engineResponseWatcher(app.log).shutdown()
    })

    return app
}



async function getAdapter() {
    const queue = system.getOrThrow<QueueMode>(AppSystemProp.QUEUE_MODE)
    switch (queue) {
        case QueueMode.MEMORY: {
            return undefined
        }
        case QueueMode.REDIS: {
            const sub = getRedisConnection().duplicate()
            const pub = getRedisConnection().duplicate()
            return createAdapter(pub, sub)
        }
    }
}


export async function appPostBoot(app: FastifyInstance): Promise<void> {

    app.log.info(`
             _____   _______   _____  __      __  ______   _____    _____   ______    _____   ______    _____
    /\\      / ____| |__   __| |_   _| \\ \\    / / |  ____| |  __ \\  |_   _| |  ____|  / ____| |  ____|  / ____|
   /  \\    | |         | |      | |    \\ \\  / /  | |__    | |__) |   | |   | |__    | |      | |__    | (___
  / /\\ \\   | |         | |      | |     \\ \\/ /   |  __|   |  ___/    | |   |  __|   | |      |  __|    \\___ \\
 / ____ \\  | |____     | |     _| |_     \\  /    | |____  | |       _| |_  | |____  | |____  | |____   ____) |
/_/    \\_\\  \\_____|    |_|    |_____|     \\/     |______| |_|      |_____| |______|  \\_____| |______| |_____/

The application started on ${system.get(WorkerSystemProp.FRONTEND_URL)}, as specified by the AP_FRONTEND_URL variables.`)

    const environment = system.get(AppSystemProp.ENVIRONMENT)
    const piecesSource = system.getOrThrow(AppSystemProp.PIECES_SOURCE)
    const pieces = process.env.AP_DEV_PIECES

    app.log.warn(
        `[WARNING]: Pieces will be loaded from source type ${piecesSource}`,
    )
    if (environment === ApEnvironment.DEVELOPMENT) {
        app.log.warn(
            `[WARNING]: The application is running in ${environment} mode.`,
        )
        app.log.warn(
            `[WARNING]: This is only shows pieces specified in AP_DEV_PIECES ${pieces} environment variable.`,
        )
    }
    const oldestPlatform = await platformService.getOldestPlatform()
    const key = system.get<string>(AppSystemProp.LICENSE_KEY)
    if (!isNil(oldestPlatform) && !isNil(key)) {
        await platformService.update({
            id: oldestPlatform.id,
            licenseKey: key,
        })
    }
}
