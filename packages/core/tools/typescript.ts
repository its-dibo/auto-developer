import { Tree, transaction } from "./schematics";
import { read } from "./files";
import { insertImport } from "@schematics/angular/utility/ast-utils";
import { createSourceFile, ScriptTarget } from "typescript";

export * from "typescript";
export * from "@schematics/angular/utility/ast-utils";

//utility/tsconfig.ts exists in the source code, but not exists in npm package
//export * from "@schematics/angular/utility/tsconfig";
export * from "@schematics/angular/utility/lint-fix";

/**
 * add ImportDeclaration (i.e: import {element} from "fromPath") into toPath
 * @method addImport
 * @param  tree      [description]
 * @param  fromPath  [description]
 * @param  toPath    [description]
 * @param  symbol    [description]
 * @return [description]
 */
export function addImport(
  tree: Tree,
  fromPath: string,
  toPath: string,
  element: string
) {
  let content = read(tree, toPath);
  if (!content) error(`file ${toPath} dosen\'t exist or empty`);

  let source = createSourceFile(toPath, content, ScriptTarget.Latest, true);
  let changes = insertImport(source, toPath, element, fromPath);

  transaction(tree, toPath, changes);
}
