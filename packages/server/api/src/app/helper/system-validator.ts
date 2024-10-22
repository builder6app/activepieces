import { AppSystemProp, ContainerType, DatabaseType, PiecesSource, QueueMode, RedisType, SharedSystemProp, system, SystemProp, WorkerSystemProps } from "@activepieces/server-shared"
import { ExecutionMode, isNil, ApEdition, PieceSyncMode, FileLocation, ApEnvironment } from "@activepieces/shared"
import { encryptUtils } from "./encryption"
import { jwtUtils } from "./jwt-utils"


function enumValidator<T extends string>(enumValues: T[]) {
    return (value: string) => {
        const isValid = enumValues.includes(value as T)
        return isValid ? true : `Value must be one of: ${enumValues.join(', ')}`
    }
}

function booleanValidator(value: string | undefined) {
    const isValid = value === 'true' || value === 'false'
    return isValid ? true : 'Value must be either "true" or "false"'
}

function numberValidator(value: string | undefined) {
    const isValid = !isNil(value) && !Number.isNaN(Number(value))
    return isValid ? true : 'Value must be a valid number'
}

function stringValidator(value: string) {
    const isValid = typeof value === 'string' && value.length > 0
    return isValid ? true : 'Value must be a non-empty string'
}

function urlValidator(value: string) {
    try {
        new URL(value)
        return true
    } catch {
        return 'Value must be a valid URL'
    }
}

const systemPropValidators: {
    [key in SystemProp]: (value: string) => true | string
} = {
    // SharedSystemProp
    [SharedSystemProp.EXECUTION_MODE]: enumValidator(Object.values(ExecutionMode)),
    [SharedSystemProp.LOG_LEVEL]: enumValidator(['error', 'warn', 'info', 'debug', 'trace']),
    [SharedSystemProp.LOG_PRETTY]: booleanValidator,
    [SharedSystemProp.ENVIRONMENT]: enumValidator(Object.values(ApEnvironment)),
    [SharedSystemProp.TRIGGER_TIMEOUT_SECONDS]: numberValidator,
    [SharedSystemProp.FLOW_TIMEOUT_SECONDS]: numberValidator,
    [SharedSystemProp.PAUSED_FLOW_TIMEOUT_DAYS]: numberValidator,
    [SharedSystemProp.APP_WEBHOOK_SECRETS]: stringValidator,
    [SharedSystemProp.MAX_FILE_SIZE_MB]: numberValidator,
    [SharedSystemProp.FRONTEND_URL]: urlValidator,
    [SharedSystemProp.CACHE_PATH]: stringValidator,
    [SharedSystemProp.PACKAGE_ARCHIVE_PATH]: stringValidator,
    [SharedSystemProp.SANDBOX_MEMORY_LIMIT]: numberValidator,
    [SharedSystemProp.SANDBOX_PROPAGATED_ENV_VARS]: stringValidator,
    [SharedSystemProp.PIECES_SOURCE]: enumValidator(Object.values(PiecesSource)),
    [SharedSystemProp.ENGINE_EXECUTABLE_PATH]: stringValidator,
    [SharedSystemProp.ENRICH_ERROR_CONTEXT]: booleanValidator,
    [SharedSystemProp.SENTRY_DSN]: urlValidator,
    [SharedSystemProp.LOKI_PASSWORD]: stringValidator,
    [SharedSystemProp.LOKI_URL]: urlValidator,
    [SharedSystemProp.LOKI_USERNAME]: stringValidator,
    [SharedSystemProp.CONTAINER_TYPE]: enumValidator(Object.values(ContainerType)),

    // AppSystemProp
    [AppSystemProp.API_KEY]: stringValidator,
    [AppSystemProp.API_RATE_LIMIT_AUTHN_ENABLED]: booleanValidator,
    [AppSystemProp.API_RATE_LIMIT_AUTHN_MAX]: numberValidator,
    [AppSystemProp.API_RATE_LIMIT_AUTHN_WINDOW]: stringValidator,
    [AppSystemProp.AZURE_OPENAI_API_VERSION]: stringValidator,
    [AppSystemProp.AZURE_OPENAI_ENDPOINT]: urlValidator,
    [AppSystemProp.CLIENT_REAL_IP_HEADER]: stringValidator,
    [AppSystemProp.CLOUD_AUTH_ENABLED]: booleanValidator,
    [AppSystemProp.CONFIG_PATH]: stringValidator,
    [AppSystemProp.COPILOT_INSTANCE_TYPE]: stringValidator,
    [AppSystemProp.DB_TYPE]: enumValidator(Object.values(DatabaseType)),
    [AppSystemProp.DEV_PIECES]: stringValidator,
    [AppSystemProp.ENCRYPTION_KEY]: stringValidator,
    [AppSystemProp.EXECUTION_DATA_RETENTION_DAYS]: numberValidator,
    [AppSystemProp.JWT_SECRET]: stringValidator,
    [AppSystemProp.LICENSE_KEY]: stringValidator,
    [AppSystemProp.MAX_CONCURRENT_JOBS_PER_PROJECT]: numberValidator,
    [AppSystemProp.OPENAI_API_BASE_URL]: urlValidator,
    [AppSystemProp.OPENAI_API_KEY]: stringValidator,
    [AppSystemProp.PIECES_SYNC_MODE]: enumValidator(Object.values(PieceSyncMode)),
    [AppSystemProp.POSTGRES_DATABASE]: stringValidator,
    [AppSystemProp.POSTGRES_HOST]: stringValidator,
    [AppSystemProp.POSTGRES_PASSWORD]: stringValidator,
    [AppSystemProp.POSTGRES_PORT]: numberValidator,
    [AppSystemProp.POSTGRES_SSL_CA]: stringValidator,
    [AppSystemProp.POSTGRES_URL]: stringValidator,
    [AppSystemProp.POSTGRES_USERNAME]: stringValidator,
    [AppSystemProp.POSTGRES_USE_SSL]: booleanValidator,
    [AppSystemProp.PROJECT_RATE_LIMITER_ENABLED]: booleanValidator,
    [AppSystemProp.QUEUE_MODE]: enumValidator(Object.values(QueueMode)),
    [AppSystemProp.QUEUE_UI_ENABLED]: booleanValidator,
    [AppSystemProp.QUEUE_UI_PASSWORD]: stringValidator,
    [AppSystemProp.QUEUE_UI_USERNAME]: stringValidator,
    [AppSystemProp.RAPID_API_KEY]: stringValidator,
    [AppSystemProp.REDIS_TYPE]: enumValidator(Object.values(RedisType)),
    [AppSystemProp.REDIS_SSL_CA_FILE]: stringValidator,
    [AppSystemProp.REDIS_DB]: numberValidator,
    [AppSystemProp.REDIS_HOST]: stringValidator,
    [AppSystemProp.REDIS_PASSWORD]: stringValidator,
    [AppSystemProp.REDIS_PORT]: numberValidator,
    [AppSystemProp.REDIS_URL]: stringValidator,
    [AppSystemProp.REDIS_USER]: stringValidator,
    [AppSystemProp.REDIS_USE_SSL]: booleanValidator,
    [AppSystemProp.REDIS_SENTINEL_ROLE]: stringValidator,
    [AppSystemProp.REDIS_SENTINEL_HOSTS]: stringValidator,
    [AppSystemProp.REDIS_SENTINEL_NAME]: stringValidator,
    [AppSystemProp.S3_ACCESS_KEY_ID]: stringValidator,
    [AppSystemProp.S3_BUCKET]: stringValidator,
    [AppSystemProp.S3_ENDPOINT]: stringValidator,
    [AppSystemProp.S3_REGION]: stringValidator,
    [AppSystemProp.S3_SECRET_ACCESS_KEY]: stringValidator,
    [AppSystemProp.S3_USE_SIGNED_URLS]: booleanValidator,
    [AppSystemProp.SMTP_HOST]: stringValidator,
    [AppSystemProp.SMTP_PASSWORD]: stringValidator,
    [AppSystemProp.SMTP_PORT]: numberValidator,
    [AppSystemProp.SMTP_SENDER_EMAIL]: (value: string) => value.includes('@') ? true : 'Value must be a valid email address',
    [AppSystemProp.SMTP_SENDER_NAME]: stringValidator,
    [AppSystemProp.SMTP_USERNAME]: stringValidator,
    [AppSystemProp.SMTP_USE_SSL]: booleanValidator,
    [AppSystemProp.TELEMETRY_ENABLED]: booleanValidator,
    [AppSystemProp.TEMPLATES_SOURCE_URL]: stringValidator,
    [AppSystemProp.TRIGGER_DEFAULT_POLL_INTERVAL]: numberValidator,
    [AppSystemProp.TRIGGER_FAILURES_THRESHOLD]: numberValidator,
    [AppSystemProp.WEBHOOK_TIMEOUT_SECONDS]: numberValidator,
    [AppSystemProp.APPSUMO_TOKEN]: stringValidator,
    [AppSystemProp.FILE_STORAGE_LOCATION]: enumValidator(Object.values(FileLocation)),
    [AppSystemProp.FIREBASE_ADMIN_CREDENTIALS]: stringValidator,
    [AppSystemProp.FIREBASE_HASH_PARAMETERS]: stringValidator,
    [AppSystemProp.STRIPE_SECRET_KEY]: stringValidator,
    [AppSystemProp.STRIPE_WEBHOOK_SECRET]: stringValidator,
    [AppSystemProp.CLOUD_PLATFORM_ID]: stringValidator,
    [AppSystemProp.CLOUDFLARE_AUTH_EMAIL]: (value: string) => value.includes('@') ? true : 'Value must be a valid email address',
    [AppSystemProp.CLOUDFLARE_ZONE_ID]: stringValidator,
    [AppSystemProp.CLOUDFLARE_API_KEY]: stringValidator,
    [AppSystemProp.EDITION]: enumValidator(Object.values(ApEdition)),

    // WorkerSystemProps
    [WorkerSystemProps.FLOW_WORKER_CONCURRENCY]: numberValidator,
    [WorkerSystemProps.SCHEDULED_WORKER_CONCURRENCY]: numberValidator,
    [WorkerSystemProps.SCHEDULED_POLLING_COUNT]: numberValidator,
    [WorkerSystemProps.POLLING_POOL_SIZE]: numberValidator,
    [WorkerSystemProps.WORKER_TOKEN]: stringValidator,
}



const validateSystemPropTypes = () => {
    const systemProperties: SystemProp[] = [...Object.values(SharedSystemProp), ...Object.values(AppSystemProp), ...Object.values(WorkerSystemProps)]
    const errors: {
        [key in SystemProp]?: string
    } = {}

    for (const prop of systemProperties) {
        const value = system.get(prop)
        const onlyValidateIfValueIsSet = !isNil(value)
        if (onlyValidateIfValueIsSet) {
            const validationResult = systemPropValidators[prop](value)
            if (validationResult !== true) {
                errors[prop] = `Current value: ${value}. Expected: ${validationResult}`
            }
        }
    }
    return errors
}

export const validateEnvPropsOnStartup = async (): Promise<void> => {
    const errors = validateSystemPropTypes()
    if (Object.keys(errors).length > 0) {
        throw new Error(JSON.stringify(errors))
    }

    const codeSandboxType = process.env.AP_CODE_SANDBOX_TYPE
    if (!isNil(codeSandboxType)) {
        throw new Error(JSON.stringify({
            message: 'AP_CODE_SANDBOX_TYPE is deprecated, please use AP_EXECUTION_MODE instead',
            docUrl: 'https://www.activepieces.com/docs/install/configuration/overview',
        }))
    }
    const queueMode = system.getOrThrow<QueueMode>(AppSystemProp.QUEUE_MODE)
    const encryptionKey = await encryptUtils.loadEncryptionKey(queueMode)
    const isValidHexKey = encryptionKey && /^[A-Za-z0-9]{32}$/.test(encryptionKey)
    if (!isValidHexKey) {
        throw new Error(JSON.stringify({
            message: 'AP_ENCRYPTION_KEY is either undefined or not a valid 32 hex string.',
            docUrl: 'https://www.activepieces.com/docs/install/configurations/environment-variables',
        }))
    }
    const isApp = system.isApp()
    if (isApp) {
        const rentionPeriod = system.getNumberOrThrow(AppSystemProp.EXECUTION_DATA_RETENTION_DAYS)
        const maximumPausedFlowTimeout = system.getNumberOrThrow(SharedSystemProp.PAUSED_FLOW_TIMEOUT_DAYS)
        if (maximumPausedFlowTimeout > rentionPeriod) {
            throw new Error(JSON.stringify({
                message: 'AP_PAUSED_FLOW_TIMEOUT_DAYS can not exceed AP_EXECUTION_DATA_RETENTION_DAYS',
            }))
        }
    }

    const jwtSecret = await jwtUtils.getJwtSecret()
    if (isNil(jwtSecret)) {
        throw new Error(JSON.stringify({
            message: 'AP_JWT_SECRET is undefined, please define it in the environment variables',
            docUrl: 'https://www.activepieces.com/docs/install/configurations/environment-variables',
        }))
    }

    const edition = system.getEdition()
    const test = system.get(SharedSystemProp.ENVIRONMENT)
    if ([ApEdition.CLOUD, ApEdition.ENTERPRISE].includes(edition) && test !== ApEnvironment.TESTING) {
        const executionMode = system.getOrThrow<ExecutionMode>(SharedSystemProp.EXECUTION_MODE)
        if (![ExecutionMode.SANDBOXED, ExecutionMode.SANDBOX_CODE_ONLY].includes(executionMode)) {
            throw new Error(JSON.stringify({
                message: 'Execution mode UNSANDBOXED is no longer supported in this edition, check the documentation for recent changes',
                docUrl: 'https://www.activepieces.com/docs/install/configuration/overview',
            }))
        }
    }
}