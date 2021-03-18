import { Tree } from '@angular-devkit/schematics';
import { SchematicsException, UpdateRecorder } from '@angular-devkit/schematics';
import { Change, InsertChange } from '@schematics/angular/utility/change';
import { JSONFile } from '@schematics/angular/utility/json-file';
import { Project } from 'ts-morph';
import * as ts from 'typescript';

import { DEFAULT_INDENTATION } from '.';

export function getTsSourceFile(host: Tree, path: string): ts.SourceFile {
    const buffer = host.read(path);
    if (!buffer) {
        throw new SchematicsException(`Could not read file (${path}).`);
    }
    const content = buffer.toString();
    const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
    return source;
}

export function persistInsertChanges(changes: Change[], recorder: UpdateRecorder): void {
    for (const change of changes) {
        if (change instanceof InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
    }
}

export function getProjectIndentationSetting(tree: Tree): number {
    const defaultIdentation = DEFAULT_INDENTATION;
    const buffer = tree.read('.editorconfig');
    if (!buffer) {
        return defaultIdentation;
    }

    const content = buffer.toString();
    if (!content) {
        return defaultIdentation;
    }

    const regex = /^indent_size = (.)/gm;
    const res = regex.exec(content);
    if (Array.isArray(res) && res[1]) {
        return +res[1];
    }

    return 0;
}

export function formatFile(tree: Tree, filePath: string, indentation: number): void {
    const project = new Project();
    project.addSourceFilesAtPaths(filePath);
    const file = project.getSourceFileOrThrow(filePath);
    file.formatText({ indentSize: indentation });
    tree.overwrite(filePath, file.getFullText());
}

export function extractProjectName(tree: Tree): string {
    const angularFile = new JSONFile(tree, 'angular.json');
    return angularFile.get(['defaultProject']) as string;
}

export function extractProjectFromName(tree: Tree, name: string): any {
    const angularFile = new JSONFile(tree, 'angular.json');
    const projects = angularFile.get(['projects']) as any;

    if (!projects) {
        throw new SchematicsException(`Projects not found.`);
    }

    return projects[name];
}
