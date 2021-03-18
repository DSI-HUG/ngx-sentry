export const LIBRARY_NAME = require('../../package.json').name;

export const DEFAULT_INDENTATION = 2;

export const MODULE_IMPORT_TEXT = `NgxSentryModule.forRoot({
    dsn: '',
    environment: environment.environment,
    release: pkg.version,
    tracingOrigins: ['*']
})`;

export const SENTRY_CLI_RC = `[defaults]
url={{sentryUrl}}
org=sentry
project={{projectName}}

;[auth]
;token= You can override the token here or use the environment variable SENTRY_AUTH_TOKEN
;More info : https://docs.sentry.io/product/cli/configuration/#configuration-file
`;
