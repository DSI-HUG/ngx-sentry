import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { getProjectFromWorkspace, ProjectDefinition } from '@hug/ngx-schematics-utilities';

import { appTest1, appTest2, getCleanAppTree, runner } from '../schematics.spec';
import { NgAddOptions } from './ng-add-options';

const joc = jasmine.objectContaining;

[false, true].forEach(useWorkspace => {
    describe(`schematics - ng-add - (${useWorkspace ? 'using workspace project' : 'using flat project'})`, () => {
        let defaultOptions: NgAddOptions;
        let tree: UnitTestTree;
        let nbFiles: number;
        let project: ProjectDefinition;

        beforeEach(async () => {
            tree = await getCleanAppTree(useWorkspace);
            nbFiles = tree.files.length;
            defaultOptions = {
                project: (useWorkspace) ? appTest2.name : appTest1.name,
                projectName: 'Sentry Project Name',
                dsnUrl: 'https://a1b2c3d4e5f6g7h8@sentry.domain.ch/4'
            } as NgAddOptions;
            project = await getProjectFromWorkspace(tree, defaultOptions.project);
        });

        it('should run without issues', async () => {
            const test$ = runner.runSchematic('ng-add', defaultOptions, tree);
            await expectAsync(test$).toBeResolved();
            expect(tree.files.length).toEqual(nbFiles + 1);
        });

        it('should create .sentryclirc', async () => {
            await runner.runSchematic('ng-add', defaultOptions, tree);
            const sentryCliRcPath = '.sentryclirc';
            expect(tree.exists(sentryCliRcPath)).toBeTruthy();
            const sentryCliRc = tree.readContent(sentryCliRcPath);
            expect(sentryCliRc).toContain('[defaults]');
            expect(sentryCliRc).toContain('org=sentry');
            expect(sentryCliRc).toContain(`url=${new URL(defaultOptions.dsnUrl).origin}`);
            expect(sentryCliRc).toContain(`project=${defaultOptions.projectName}`);
        });

        it('should update tsconfig.json', async () => {
            await runner.runSchematic('ng-add', defaultOptions, tree);
            const tsconfig = tree.readJson('tsconfig.json');
            expect(tsconfig).toEqual(joc({
                compilerOptions: joc({
                    resolveJsonModule: true,
                    allowSyntheticDefaultImports: true
                })
            }));
        });

        it('should update main.ts (module)', async () => {
            await runner.runSchematic('ng-add', defaultOptions, tree);
            const mainTsContent = tree.readContent(project.pathFromSourceRoot('main.ts'));
            expect(mainTsContent).toContain('import { initSentry } from \'@hug/ngx-sentry\';');
            expect(mainTsContent).toContain('import { isDevMode } from \'@angular/core\';');
            expect(mainTsContent).toContain('import packageJson from \'package.json\';');
            expect(mainTsContent).toContain('initSentry({\n' +
            `  dsn: '${defaultOptions.dsnUrl}',\n` +
            '  environment: \'DEV\', // replace it with your own value\n' +
            '  release: packageJson.version,\n' +
            '  enabled: !isDevMode()\n' +
            '});');
        });

        it('should update main.ts (standalone)', async () => {
            // prepare
            const mainTsPath = project.pathFromSourceRoot('main.ts');
            tree.overwrite(mainTsPath, `import { bootstrapApplication } from '@angular/platform-browser';\n${tree.readContent(mainTsPath)}\n\nbootstrapApplication(AppComponent);\n`);

            await runner.runSchematic('ng-add', defaultOptions, tree);
            const mainTsContent = tree.readContent(mainTsPath);
            expect(mainTsContent).toContain('import { initSentry, provideSentry } from \'@hug/ngx-sentry/standalone\';');
            expect(mainTsContent).toContain('import { isDevMode } from \'@angular/core\';');
            expect(mainTsContent).toContain('import packageJson from \'package.json\';');
            expect(mainTsContent).toContain('initSentry({\n' +
            `  dsn: '${defaultOptions.dsnUrl}',\n` +
            '  environment: \'DEV\', // replace it with your own value\n' +
            '  release: packageJson.version,\n' +
            '  enabled: !isDevMode()\n' +
            '});');
            expect(mainTsContent).toContain('provideSentry()');
        });

        it('should update app.module.ts', async () => {
            await runner.runSchematic('ng-add', defaultOptions, tree);
            const appModuleContent = tree.readContent(project.pathFromSourceRoot('app/app.module.ts'));
            expect(appModuleContent).toContain('import { NgxSentryModule } from \'@hug/ngx-sentry\'');
            expect(appModuleContent).toContain('NgxSentryModule.forRoot()');
        });
    });
});
