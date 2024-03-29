<h1 align="center">
    @hug/ngx-sentry
</h1>

<p align="center">
    <br/>
    <a href="https://www.hug.ch">
        <img src="https://cdn.hug.ch/svgs/hug/hug-logo-horizontal.svg" alt="hug-logo" height="54px" />
    </a>
    <br/><br/>
    <i>Angular wrapper for the official Sentry JavaScript SDK</i>
    <br/><br/>
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@hug/ngx-sentry">
        <img src="https://img.shields.io/npm/v/@hug/ngx-sentry.svg?color=blue&logo=npm" alt="npm version" /></a>
    <a href="https://npmcharts.com/compare/@hug/ngx-sentry?minimal=true">
        <img src="https://img.shields.io/npm/dw/@hug/ngx-sentry.svg?color=blue&logo=npm" alt="npm donwloads" /></a>
    <a href="https://github.com/dsi-hug/ngx-sentry/blob/main/LICENSE">
        <img src="https://img.shields.io/badge/license-GPLv3-ff69b4.svg" alt="license GPLv3" /></a>
</p>

<p align="center">
    <a href="https://github.com/dsi-hug/ngx-sentry/actions/workflows/ci_tests.yml">
        <img src="https://github.com/dsi-hug/ngx-sentry/actions/workflows/ci_tests.yml/badge.svg" alt="build status" /></a>
    <a href="https://github.com/dsi-hug/ngx-sentry/blob/main/CONTRIBUTING.md#-submitting-a-pull-request-pr">
        <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome" /></a>
</p>

<hr/>

## Getting started

To set up or update an Angular project with this library use the Angular CLI's [schematic][schematics] commands:

#### Installation

```sh
ng add @hug/ngx-sentry
```

<details>
    <summary><i>More details</i></summary>

> <br/>
>
> The `ng add` command will ask you the following questions:
>
> 1.  **Name of the project in Sentry**: *the name used when creating the Sentry project*
> 2.  **Data Source Name (DSN) url**: *the url provided during the Sentry project creation process*
>
> And will also perform the following actions:
>
> -   Create a `.sentryclirc` file containing all the Sentry configurations
> -   Initialize and configure Sentry in `main.ts`
> -   Add `resolveJsonModule` and `allowSyntheticDefaultImports` to `tsconfig.json`
> -   Import the `NgxSentryModule` in your Angular application module (if app is not standalone)

</details>

#### Update

```sh
ng update @hug/ngx-sentry
```


## Usage

Follow these steps to integrate your project's source maps with Sentry:

1. Generate Source Maps
   ```sh
   ng build --source-map
   ```

2. Provide Source Maps to Sentry
   ```sh
   npx ngx-sentry ./project-dist-path
   ```


## Options

This library is a wrapper around the official [Sentry JavaScript SDK][sentry-sdk-url] with extra functionalities and configurations.

All options available in `@sentry/browser` can be configured from `@hug/ngx-sentry`.

You shouldn't have to configure anything else but in case you wanted to, you can still do it.

#### Sentry Browser's SDK

The Sentry Browser's SDK can be configured in `main.ts`:

```ts
initSentry(options: BrowserOptions);
```

#### Error handler

The behavior of the error handler can be configured either in:

* `main.ts` *(if the app is a standalone Angular application)*
    ```ts
    bootstrapApplication(AppComponent, {
      providers: [
        provideSentry(options?: ErrorHandlerOptions)
      ]
    });
    ```

* `app.module.ts` *(if the app is **not** a standalone Angular application)*
    ```ts
    @NgModule({
      imports: [
        NgxSentryModule.forRoot(options?: ErrorHandlerOptions)
      ]
    })
    export class AppModule { }
    ```

#### Current user

You can define the current user via the `setSentryUser()` api:

```ts
// import { setSentryUser } from '@hug/ngx-sentry/standalone';
// import { setSentryUser } from '@hug/ngx-sentry';

public ngOnInit(): void {
  // Set the current user
  setSentryUser({
    email: 'rtrm@hcuge.ch',
    username: 'rtrm',
    attr1: 'attr1'
  });

  // Remove the current user
  setSentryUser(null);
}
```

## Development

See the [developer docs][developer].


## Contributing

#### > Want to Help?

Want to file a bug, contribute some code or improve documentation? Excellent!

But please read up first on the guidelines for [contributing][contributing], and learn about submission process, coding rules and more.

#### > Code of Conduct

Please read and follow the [Code of Conduct][codeofconduct], and help us keep this project open and inclusive.


## Credits

Copyright (C) 2021 [HUG - Hôpitaux Universitaires Genève][dsi-hug]

[![love@hug](https://img.shields.io/badge/@hug-%E2%9D%A4%EF%B8%8Flove-magenta)][dsi-hug]




[schematics]: https://angular.io/guide/schematics-for-libraries
[sentry-sdk-url]: https://github.com/getsentry/sentry-javascript
[developer]: https://github.com/dsi-hug/ngx-sentry/blob/main/DEVELOPER.md
[contributing]: https://github.com/dsi-hug/ngx-sentry/blob/main/CONTRIBUTING.md
[codeofconduct]: https://github.com/dsi-hug/ngx-sentry/blob/main/CODE_OF_CONDUCT.md
[dsi-hug]: https://github.com/dsi-hug
