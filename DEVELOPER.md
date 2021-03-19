# Development

This document describes how you can test, build and publish the library and schematics.

## Testing

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
   npm link LIBRARY_NAME (or) yarn link LIBRARY_NAME
   ```

4. Run and test the library and schematics against the Angular project

   ```sh
   ng add LIBRARY_NAME
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

## Unit testing

Unit tests can be executed on the library itself or on the schematics.

```sh
npm run test:lib
npm run test:schematics
```

## Building the library

The library will be built in the `./dist/library` directory.

Schematics will be embedded within the library under `./dist/library/schematics`.

```sh
npm run build
```

## Publishing the library

This project comes with automatic continuous delivery (CD) using GitHub Actions.

1. Bump the library version in `./projects/library/package.json`

2. Push the changes

3. Create a new: [GitHub release](https://github.com/GITHUB_REPO_NAME/releases/new)

4. Watch the results in: [Actions](https://github.com/GITHUB_REPO_NAME/actions)