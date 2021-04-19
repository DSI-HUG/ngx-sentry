export const libraryName = '@hug/ngx-sentry';

export const defaultIndentation = 2;

export const sentryCliRc = `[defaults]
url={{sentryUrl}}
org=sentry
project={{projectName}}

;[auth]
;token= You can override the token here or use the environment variable SENTRY_AUTH_TOKEN
;More info : https://docs.sentry.io/product/cli/configuration/#configuration-file
`;


export interface AngularJsonProject {
    sourceRoot: string;
    architect: {
        build: {
            options: {
                outputPath: string;
            };
        };
    };
}
