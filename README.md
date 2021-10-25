<h1 align="center">
    @hug/ngx-sentry
</h1>

<p align="center">
    <br>
    <a href="https://www.hug.ch/">
        <img src="https://www.hug.ch/sites/all/themes/interhug/img/logos/logo-hug.svg" alt="hug-logo" height="54px" />
    </a>
    <br><br>
    <i>Angular wrapper for the official Sentry JavaScript SDK</i>
    <br><br>
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@hug/ngx-sentry">
        <img src="https://img.shields.io/npm/v/@hug/ngx-sentry.svg?color=blue&logo=npm" alt="npm version" />
    </a>
    <a href="https://npmcharts.com/compare/@hug/ngx-sentry?minimal=true">
        <img src="https://img.shields.io/npm/dw/@hug/ngx-sentry.svg?color=blue&logo=npm" alt="npm donwloads" />
    </a>
    <a href="https://github.com/DSI-HUG/ngx-sentry/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-GPLv3-ff69b4.svg" alt="license GPLv3" />
    </a>
</p>

<p align="center">
    <a href="https://github.com/DSI-HUG/ngx-sentry/actions?query=workflow:CI%20tests">
        <img src="https://github.com/DSI-HUG/ngx-sentry/workflows/CI%20tests/badge.svg" alt="build status" />
    </a>
    <a href="https://david-dm.org/DSI-HUG/ngx-sentry">
        <img src="https://img.shields.io/david/DSI-HUG/ngx-sentry.svg" alt="dependency status" />
    </a>
    <a href="https://david-dm.org/DSI-HUG/ngx-sentry?type=peer">
        <img src="https://img.shields.io/david/peer/DSI-HUG/ngx-sentry.svg" alt="peerDependency status" />
    </a>
    <a href="https://github.com/DSI-HUG/ngx-sentry/blob/master/CONTRIBUTING.md#-submitting-a-pull-request-pr">
        <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome" />
    </a>
</p>

<hr>

## Getting started

To set up or update an Angular project with this library use the Angular CLI's [schematic][schematics] commands:

#### Installation

```sh
$ ng add @hug/ngx-sentry
```

#### Update

```sh
$ ng update @hug/ngx-sentry
```

----

The `ng add` command will install Sentry dependencies, the HUG Wrapper configuration and ask you the following questions:

1.  **Sentry's project name**: *the name used when creating the Sentry project*
2.  **Sentry's dsn url**: *Data Source Name url provided during the Sentry project creation process*

The `ng add` command will additionally perform the following actions:

-   Add dependencies to `package.json`
-   Add `resolveJsonModule` and `allowSyntheticDefaultImports` to `tsconfig.json`
-   Create a `.sentryclirc` file containing all the Sentry configurations
-   Initialize and configure Sentry in `main.ts`
-   Import the `NgxSentryModule` in your Angular application module


## Usage

Follow these steps to integrate your project's source maps with Sentry:

1. **Generate Source Maps**
```sh
$ ng build --source-map
```

2. **Provide Source Maps to Sentry**
```sh
$ npx ngx-sentry ./dist/your-project-name
```


## Options

This library is a wrapper around the official Sentry JavaScript SDK, with added functionalities and configurations.

You shouldn't have to configure anything else but in case you wanted to, you can still do it.

All options available in `@sentry/browser` can be configured from `@hug/ngx-sentry`.

#### Sentry Browser's SDK

The Sentry Browser's SDK can be configured in `main.ts`:

```ts
/**
 * @param {BrowserOptions} browserOptions
 * @link https://github.com/getsentry/sentry-javascript/blob/143ee3991e99a07bf60ee21a53723253a7f1c2fb/packages/browser/src/backend.ts#L12
 */
initSentry(browserOptions: BrowserOptions);
```

#### ErrorHandler

The behavior of the ErrorHandler can be configured in `app.module.ts`:

```ts
@NgModule({
    imports: [
        /**
         * @param {errorHandlerOptions} ErrorHandlerOptions
         * @link https://github.com/getsentry/sentry-javascript/blob/master/packages/angular/src/errorhandler.ts#L10
         */
        NgxSentryModule.forRoot(errorHandlerOptions?: ErrorHandlerOptions)
    ]
})
export class AppModule { }
```

#### Current user

You can define the current user via the `NgxSentryService`:

```ts
constructor(
    private sentryService: NgxSentryService
) {}

public ngOnInit(): void {
    // Set the current user
    this.sentryService.setUser({
        email: 'rtrm@hcuge.ch',
        username: 'rtrm',
        attr1: 'attr1'
    });

    // Remove the current user
    this.sentryService.setUser(null);
}
```

## Development

See the [developer docs][developer].


## Contributing

#### Want to Help?

Want to file a bug, contribute some code or improve documentation? Excellent!

But please read up first on the guidelines for [contributing][contributing], and learn about submission process, coding rules and more.

#### Code of Conduct

Please read and follow the [Code of Conduct][codeofconduct], and help us keep this project open and inclusive.


## Credits

This library was made with [@hug/ngx-lib-and-schematics-starter][starter].

[![love@hug](https://img.shields.io/badge/@hug-%E2%9D%A4%EF%B8%8Flove-magenta)][dsi-hug]




[schematics]: https://angular.io/guide/schematics-for-libraries
[developer]: https://github.com/DSI-HUG/ngx-sentry/blob/master/DEVELOPER.md
[contributing]: https://github.com/DSI-HUG/ngx-sentry/blob/master/CONTRIBUTING.md
[codeofconduct]: https://github.com/DSI-HUG/ngx-sentry/blob/master/CODE_OF_CONDUCT.md
[starter]: https://github.com/DSI-HUG/ngx-lib-and-schematics-starter
[dsi-hug]: https://github.com/DSI-HUG
