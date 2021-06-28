import { JsonValue, normalize, strings } from '@angular-devkit/core';
import { apply, applyTemplates, MergeStrategy, mergeWith, move, Rule, SchematicsException, Tree, url } from '@angular-devkit/schematics';
import {
    createSourceFile, ScriptTarget, SourceFile
} from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { insertImport } from '@schematics/angular/utility/ast-utils';
import { applyToUpdateRecorder, Change } from '@schematics/angular/utility/change';
import { InsertionIndex, JSONFile, JSONPath } from '@schematics/angular/utility/json-file';

export const serializeToJson = (obj: unknown): string => `${JSON.stringify(obj, null, 2)}\n`;

export const deployFiles = (templateOptions = {}, source = './files', destination = '', strategy = MergeStrategy.Overwrite): Rule =>
    mergeWith(
        apply(url(source), [
            applyTemplates({
                utils: strings,
                ...templateOptions
            }),
            move(normalize(destination))
        ]),
        strategy
    );

export const deleteFiles = (files: string[]): Rule =>
    (tree: Tree): void => {
        files.forEach(file => {
            if (tree.exists(file)) {
                tree.delete(file);
            }
        });
    };

export const replaceInFile = (filePath: string, searchValue: string | RegExp, replaceValue: string): Rule =>
    (tree: Tree): void => {
        if (tree.exists(filePath)) {
            const content = tree.read(filePath)?.toString('utf-8') || '';
            const newContent = content.replace(searchValue, replaceValue);
            if (content !== newContent) {
                tree.overwrite(filePath, newContent);
            }
        }
    };

export const removeInJson = (filePath: string, jsonPath: JSONPath): Rule =>
    (tree: Tree): void => {
        if (tree.exists(filePath)) {
            const jsonFile = new JSONFile(tree, filePath);
            if (jsonFile.get(jsonPath) !== undefined) {
                jsonFile.remove(jsonPath);
            }
        }
    };

export const modifyJson = (filePath: string, jsonPath: JSONPath, value: JsonValue | undefined, insertInOrder?: InsertionIndex | false): Rule =>
    (tree: Tree): void => {
        if (tree.exists(filePath)) {
            const jsonFile = new JSONFile(tree, filePath);
            if ((jsonPath.length === 0) && (JSON.stringify(JSON.parse(jsonFile.content)) === JSON.stringify(value))) {
                return;
            } else if (JSON.stringify(jsonFile.get(jsonPath)) === JSON.stringify(value)) {
                return;
            } else {
                jsonFile.modify(jsonPath, value, insertInOrder);
            }
        }
    };

export const createOrUpdateFile = (filePath: string, content: unknown): Rule =>
    (tree: Tree): void => {
        if (!tree.exists(filePath)) {
            tree.create(filePath, (typeof content === 'string') ? content : serializeToJson(content));
        } else {
            const actualContent = tree.read(filePath)?.toString('utf-8');
            const newContent = (typeof content === 'string') ? content : serializeToJson(content);
            if (actualContent !== newContent) {
                tree.overwrite(filePath, newContent);
            }
        }
    };

export const getTsSourceFile = (tree: Tree, filePath: string): SourceFile => {
    const buffer = tree.read(filePath);
    if (!buffer) {
        throw new SchematicsException(`File ${filePath} does not exist.`);
    }
    return createSourceFile(filePath, buffer.toString('utf-8'), ScriptTarget.Latest, true);
};

export const commitChanges = (tree: Tree, filePath: string, changes: Change[]): void => {
    const recorder = tree.beginUpdate(filePath);
    applyToUpdateRecorder(recorder, changes);
    tree.commitUpdate(recorder);
};

export const addImportToFile = (filePath: string, symbolName: string, fileName: string, isDefault?: boolean): Rule =>
    (tree: Tree): void => {
        const sourceFile = getTsSourceFile(tree, filePath);
        const changes = insertImport(sourceFile, '', symbolName, fileName, isDefault);
        commitChanges(tree, filePath, [changes]);
    };
