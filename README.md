# @hug/ngx-sentry

[![npm version](https://img.shields.io/npm/v/@hug/ngx-sentry.svg?logo=npm&logoColor=fff&label=NPM+package&color=limegreen)](https://www.npmjs.com/package/@hug/ngx-sentry) [![npm downloads](https://img.shields.io/npm/dm/@hug/ngx-sentry.svg)](https://npmcharts.com/compare/@hug/ngx-sentry?minimal=true) [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com) [![Build Status](https://github.com/DSI-HUG/ngx-sentry/workflows/CI%20tests/badge.svg)](https://github.com/DSI-HUG/ngx-sentry/actions?query=workflow:CI%20tests) [![Dependency Status](https://img.shields.io/david/DSI-HUG/ngx-sentry.svg)](https://david-dm.org/DSI-HUG/ngx-sentry) [![devDependency Status](https://img.shields.io/david/dev/DSI-HUG/ngx-sentry.svg)](https://david-dm.org/DSI-HUG/ngx-sentry#info=devDependencies)

<!-- edit: description -->

## Installation

To set up an Angular project with this library use the Angular CLI's installation [schematic][schematics]:

```sh
ng add @hug/ngx-sentry
```

<!-- edit:
The ng add command will install the library and ask the following questions to determine which features to include:

1. lorem ipsum
2. lorem ipsum

The ng add command will additionally perform the following configurations:

* lorem ipsum
* lorem ipsum
-->


## Usage

<!-- edit: usage -->


## Development

### Testing

The library and schematics can be tested on an Angular project while being developed:

1. Ouput the library and schematics to dist and watch for changes

   ```sh
   npm run start:lib
   npm run start:schematics
   ```

2. Symlink the library to the global node_modules

   ```sh
   cd ./dist/library
   npm link (or) yarn link
   ```

3. Create a dummy Angular project and link the library to it

   ```sh
   ng new test-lib ./test-lib
   npm link @hug/ngx-sentry (or) yarn link @hug/ngx-sentry
   ```

4. Run and test the library and schematics against the Angular project

   ```sh
   ng add @hug/ngx-sentry
   ```

**Tips** - ***you can use git to watch the effective changes made by the schematics:***

1. Make a clean state after creating the dummy Angular project

   ```sh
   git commit -am 'clean state'
   ```

2. Run the schematics and check the changes

   ```sh
   git status
   ```

3. Reset changes, modify the library or schematics and test them again

   ```sh
   git reset --hard && git clean -fd
   ```

### Unit testing

Unit tests can be executed on the library itself or on the schematics.

```sh
npm run test:lib
npm run test:schematics
```

### Building the library

The library will be built in the `./dist/library` directory.

Schematics will be embedded within the library under `./dist/library/schematics`.

```sh
npm run build
```

### Publishing the library

This project comes with automatic continuous delivery (CD) using GitHub Actions.

1. Bump the library version in `./projects/library/package.json`

2. Push the changes

3. Create a new: [GitHub release](https://github.com/@hug/ngx-sentry/releases/new)

4. Watch the results in: [Actions](https://github.com/@hug/ngx-sentry/actions)


## Contributing

### Want to Help?

Want to file a bug, contribute some code or improve documentation? Excellent!

But please read up first on the guidelines for [contributing][contributing], and learn about submission process, coding rules and more.

### Code of Conduct

Help us keep this project open and inclusive.

Please read and follow the [Code of Conduct][codeofconduct].




[schematics]: https://angular.io/guide/schematics-for-libraries
[contributing]: CONTRIBUTING.md
[codeofconduct]: CODE_OF_CONDUCT.md
