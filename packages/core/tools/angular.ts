import { Tree, error as _error, transaction, Rule } from "./schematics";
import { read } from "./files";
import { json } from "./json";
import { addValue } from "./objects";
import {
  findModule as _findModule,
  buildRelativePath,
  ModuleOptions
} from "@schematics/angular/utility/find-module";
import {
  createSourceFile,
  ScriptTarget,
  addImportToModule,
  addExportToModule,
  addDeclarationToModule,
  addProviderToModule,
  addBootstrapToModule
} from "./typescript";
import { basename } from "path";

export * from "@schematics/angular/utility/workspace";
export * from "@schematics/angular/utility/workspace-models";
export * from "@schematics/angular/utility/find-module";
export * from "@schematics/angular/utility/latest-versions";
export * from "@schematics/angular/utility/config";
export * from "@schematics/angular/utility/ng-ast-utils";

function error(msg: string, mark?: string) {
  return _error(msg, `[tools/angular] ${mark}`);
}

export function findModule(tree, path, options) {
  if (options === false) return path;
  if (options === true) options = [".module.ts", "-routing.module.ts"];
  try {
    return _findModule(tree, path, ...(options || []));
  } catch (error) {
    //todo: return {error}
    return null;
  }
}

/**
 * add an element to @NgModule.imports[], ...
 * @method addToNgModule
 * @param  tree [description]
 * @param  type [description]
 * @param  element the symbol name to be added
 * @param  module module file's path
 * @param  fromPath add ImportDeclaration, same as addImport()
 * @return [description]
 *
 * todo:
 *  - type: | component | directive | ....
 */
export function addToNgModule(
  tree: Tree,
  type = "import" | "declaration" | "provider" | "export" | "bootstrap",
  element: string, //path to: module, component, service, ...
  module: string,
  fromPath?: string
) {
  if (!module) error("no module provided to addToNgModule()");
  //module = findModule(tree, module, options.findModule);

  //todo: add all Angular class types
  if (["component", "directive", "pipe"].includes(type)) type = "declaration";
  else if (["service"].includes(type)) type = "provider";

  let content = read(tree, module);
  if (!content) error(`module dosen\'t exist or empty ${module}`);

  let source = createSourceFile(module, content, ScriptTarget.Latest, true);

  //todo: https://github.com/angular/angular-cli/issues/17971
  //if(fromPath && /* ! isPackageName(fromPath)*/)fromPath = buildRelativePath(module, element);

  let functionsList = {
    import: addImportToModule,
    export: addExportToModule,
    declaration: addDeclarationToModule,
    provider: addProviderToModule,
    bootstrap: addBootstrapToModule
  };

  let changes = functionsList[type](source, module, element, fromPath);

  transaction(tree, module, changes);
}

/**
 * @method modify angular.json file.
 * @param  tree                 [description]
 * @param  options              ex: {styles: ['style.css'], assets:['asset.png']}; value must be of the same type of the key, ex: {styles: []}, not {styles:""}
 * @param  project              [description]
 * @param  file="/angular.json" [description]
 * @param  target="build"       [description]
 * @param  type="production"    [description]
 * @return [description]
 */
export function angular(
  tree: Tree,
  options: { [path: string]: any },
  project?: string,
  file = "/angular.json",
  targets: string[] = ["build"], //for options, configurations
  type = "production" //for configurations
): Rule {
  var content = json.read(tree, file);
  if (!content) error(`${file} dosen't exist.`);

  //todo: if(!project)getDefaultProject()

  targets.forEach(target => {
    for (var path in options) {
      let value = options[path];

      //for other properties, use full path: ex: projects[project]....
      if (
        [
          "outputPath",
          "index",
          "main",
          "polyfills",
          "tsConfig",
          "aot",
          "assets",
          "styles",
          "scripts",
          "serviceWorker",
          "ngswConfigPath"
        ].includes(path)
      )
        path = `projects.${project}.architect.${target}.options.${path}`;
      else if (
        [
          "optimization",
          "outputHashing",
          "sourceMap",
          "extractCss",
          "namedChunks",
          "extractLicenses",
          "vendorChunk",
          "buildOptimizer",
          "fileReplacements",
          "budgets"
        ].includes(path)
      )
        path = `projects.${project}.architect.${target}.configurations.${type}.${path}`;
      content = addValue(content, path, value, "merge");
    }
  });
  return json.write(tree, file, content, "replace");
}

export function getIndexFiles(tree: Tree, file = "/angular.json") {
  //todo: getProjectIndexFiles(project);
  return ["/src/index.html"];
}
