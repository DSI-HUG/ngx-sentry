# Development

This document describes how you can test, build and publish the library and schematics.

## Prerequisite

Before you can build and test this library you must install and configure the following products on your development machine:

* [Git][git]
* [Node.js][nodejs]
* [Yarn][yarn]

You will then need to install the required dependencies:

```sh
$ cd <library-path>
$ yarn global add @angular-devkit/schematics-cli
$ yarn install
```

## Testing locally

The library and schematics can be tested on an Angular project while being developed:

1. Ouput the library and schematics to dist and watch for changes

   ```sh
   $ yarn start:lib
   $ yarn start:schematics
   ```

2. Symlink the library to the global node_modules

   ```sh
   $ cd ./dist/library
   $ yarn link
   ```

3. Create a dummy Angular project and link the library to it

   ```sh
   $ ng new test-lib ./test-lib
   $ yarn link @hug/ngx-sentry
   ```

4. Run and test the library and schematics against the Angular project

   ```sh
   $ ng add @hug/ngx-sentry
   ```

**Tips** - ***you can use git to watch the effective changes made by the schematics:***

1. Make a clean state after creating the dummy Angular project

   ```sh
   $ git commit -am 'clean state'
   ```

2. Run the schematics and check the changes

   ```sh
   $ git status
   ```

3. Reset changes, modify the library or schematics and test them again

   ```sh
   $ git reset --hard && git clean -fd
   ```

## Unit testing

Unit tests can be executed on the library itself or on the schematics.

```sh
$ yarn test:lib
$ yarn test:schematics
```

## Linting/verifying source code

Check that the code is properly formatted and adheres to coding style.

```sh
$ yarn lint
```

## Building the library

The library will be built in the `./dist/library` directory.

Schematics will be embedded within the library under `./dist/library/schematics`.

```sh
$ yarn build
```

## Publishing to NPM repository

This project comes with automatic continuous delivery (CD) using *GitHub Actions*.

1. Bump the library version in `./projects/library/package.json`
2. Push the changes
3. Create a new: [GitHub release](https://github.com/DSI-HUG/ngx-sentry/releases/new)
4. Watch the results in: [Actions](https://github.com/DSI-HUG/ngx-sentry/actions)



[git]: https://git-scm.com/
[nodejs]: https://nodejs.org/
[yarn]: https://yarnpkg.com/
