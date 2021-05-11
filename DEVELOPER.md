# Development

This document describes how you can test, build and publish the library and schematics.

## Prerequisite

Before you can build and test this library you must install and configure the following products on your development machine:

* [Git][git]
* [Node.js][nodejs]

You will then need to install the required dependencies:

```sh
$ cd <library-path>
$ npm install -g @angular-devkit/schematics-cli
$ npm install
```

## Testing locally

The library and schematics can be tested on an Angular project while being developed.

The whole process is already automated for you so you can focus only on the development.

This includes:

* Ouputting the library and schematics to the `./dist` folder
* Creating a dummy Angular project in `./tmp/test-lib`
* Symlinking the library with the dummy project
* Watching for library and schematics changes

**Testing**

1. Start testing

   ```sh
   $ cd <library-path>
   $ npm start

2. Run and test the library and schematics against the Angular project

   ```sh
   $ cd ./tmp/test-lib
   $ ng add @hug/ngx-sentry
   ```

**Known issues**

When using `npm`, any package installation made by your schematics will remove the symlink to the library ([#3](https://github.com/npm/rfcs/pull/3), [#2372](https://github.com/npm/cli/issues/2372)).

To fix this issue, run the following command after each package installation:

   ```sh
   $ cd ./tmp/test-lib
   $ npm link @hug/ngx-sentry
   ```

**Tips** - ***you can use git to watch the effective changes made by the schematics:***

1. Make a clean state after creating the dummy Angular project

   ```sh
   $ cd ./tmp/test-lib
   $ git commit -am 'clean state'
   ```

2. Run the schematics and check the changes

   ```sh
   $ ng add @hug/ngx-sentry
   $ git status
   ```

3. Reset changes, modify the library or schematics and test them again

   ```sh
   $ git reset --hard && git clean -fd
   ```

## Unit testing

Unit tests can be executed on the library itself or on the schematics.

```sh
$ npm run test:lib
$ npm run test:schematics
```

## Linting/verifying source code

Check that the code is properly formatted and adheres to coding style.

```sh
$ npm run lint
```

## Building the library

> The library will be built in the `./dist` directory.

> Schematics will be embedded within the library under `./dist/schematics`.

```sh
$ npm run build
```

## Publishing to NPM repository

This project comes with automatic continuous delivery (CD) using *GitHub Actions*.

1. Bump the library version in `./package.json`
2. Push the changes
3. Create a new: [GitHub release](https://github.com/DSI-HUG/ngx-sentry/releases/new)
4. Watch the results in: [Actions](https://github.com/DSI-HUG/ngx-sentry/actions)



[git]: https://git-scm.com/
[nodejs]: https://nodejs.org/
