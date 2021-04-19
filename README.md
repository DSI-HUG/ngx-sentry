<h1 align="center">
    @hug/ngx-sentry
</h1>

<p align="center">
    <br>
    <a href="https://www.hug.ch/">
        <img src="https://www.hug.ch/sites/all/themes/interhug/img/logos/logo-hug.svg" alt="hug-logo" height="54px" />
    </a>
    <br><br>
    <i>Angular wrapper for Sentry JavaScript SDK</i>
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
        <img src="https://img.shields.io/david/dev/DSI-HUG/ngx-sentry.svg" alt="peerDependency status" />
    </a>
    <a href="https://github.com/DSI-HUG/ngx-sentry/blob/master/CONTRIBUTING.md#-submitting-a-pull-request-pr">
        <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome" />
    </a>
</p>

<hr>

## Installation

To set up an Angular project with this library use the Angular CLI's installation [schematic][schematics]:

```sh
$ ng add @hug/ngx-sentry
```

The  `ng add`  command will install Sentry dependencies, the HUG Wrapper configuration and ask you the following questions:

1.  Sentry's dsn url:

    You can pass your project sentry url (providing during the project creation process) to configure automatically all the Sentry configurations.

The  `ng add`  command will additionally perform the following configurations:

-   Add project dependencies to  `package.json`
-   Create the `.sentryclirc` file containing the project configuration
-   Add Sentry versioning and sourcemap configurations to `package.json`
-   Allow json module resolving to `tsconfig.json`
-   Add `sentryUrl` property to your `environments.*.ts` files
-   Import NgxSentryModule to your application module

You're done! Sentry is now configured to be used in your application.


## Usage

You can set the current user by using the NgxSentryService provided by the library.

```javascript
constructor(
    private sentryService: NgxSentryService,
) {
    this.sentryService.setUser({
        email: 'rtrm@hcuge.ch',
        username: 'rtrm',
        attr1: 'attr1'
    });
}
```

To remove the current user, you can pass null

```javascript
constructor(
    private sentryService: NgxSentryService,
) {
    this.sentryService.setUser(null);
}
```

## Development

See the [developer docs][developer].


## Contributing

### Want to Help?

Want to file a bug, contribute some code or improve documentation? Excellent!

But please read up first on the guidelines for [contributing][contributing], and learn about submission process, coding rules and more.

### Code of Conduct

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
