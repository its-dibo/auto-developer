import {
  NodeDependency,
  NodeDependencyType,
  addPackageJsonDependency,
  getPackageJsonDependency,
  removePackageJsonDependency
} from "@schematics/angular/utility/dependencies";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import { Tree, Rule, SchematicContext, error } from "./schematics";
import { merge, deepMerge, objectType, Obj } from "./objects";
import { read, write } from "./files";

//todo: enum
/*
  {x:1, y:2, obj:{a:1, b:2}} & {y:3, z:4, obj: {b:3, c:4}}

 - merge: merge the new data with the exising data. -> {x:1, y:3, z:4, obj: {b:3, c:4}}
 - softMerge: same as above, but the existing data take the precedence over the new data. -> {x:1, y:2, obj:{a:1, b:2}}
 - deepMerge: merge the property and all of it's children and children of children.  -> {x:1, y:3, z:4, {a:1, b:3, c:4}}
 - replace: replace the existing data with the new data. -> {y:3, z:4, obj: {b:3, c:4}}
 - skip: if there is existing data, skip adding the new data. -> {x:1, y:2, obj:{a:1, b:2}}
 - error: throw an error and stop.
 */

//renamed from 'Strategy' to 'JsonWriteStrategy' to remove the conflict with ./files.ts->Strategy in ./index.ts
export type JsonWriteStrategy =
  | "merge"
  | "softMerge"
  | "deepMerge"
  | "replace"
  | "skip"
  | "error";

export const json = {
  str(data: Obj) {
    //todo: if(objectType(data)==function)data=data(..)
    return JSON.stringify(data, null, 2); //the third parameter is `space`,
  },
  parse(data) {
    //return JSON.parse(stripJsonComments(data));
    return JSON.parse(data);
  },
  read(tree: Tree, file: string, enc: string = "utf-8"): Obj {
    let content = read(tree, file);
    return !file.endsWith(".json") ? this.parse(content) : content;
  },
  write(
    tree: Tree,
    file: string,
    data: Obj,
    strategy: JsonWriteStrategy = "merge",
    removeNull = false
  ): Tree {
    //if !replace, we don't need to check if the file existing, and we don't need to read it
    if (strategy !== "replace") {
      let existingData = this.read(tree, file);
      if (existingData) {
        if (strategy === "skip") return tree;
        else if (strategy === "error")
          error(`[tools: json.write()] the file ${file} is not empty.`);
        else if (strategy === "merge")
          data = merge(data, existingData, removeNull);
        else if (strategy === "softMerge")
          data = merge(existingData, data, removeNull);
        else if (strategy === "deepMerge") {
          data = deepMerge(data, existingData);
        }
      }
    }

    return write(tree, file, this.str(data), "replace");
  }
};

export interface PackageDependencies {
  [name: string]: string;
}
export const packages = {
  //todo: if(!file)tree.create(file)
  add(
    tree: Tree,
    dependencies: PackageDependencies,
    type: NodeDependencyType = NodeDependencyType.Default,
    file = "/package.json",
    overwrite?: boolean
  ): Tree {
    if (file.slice(-5) !== ".json") file += "/package.json";
    if (!tree.exists(file)) tree.create(file, "{}");

    for (let k in dependencies) {
      let dependency: NodeDependency = {
        type,
        name: k,
        version: dependencies[k],
        overwrite
      };
      addPackageJsonDependency(tree, dependency, file);
    }
    return tree;
  },

  get(tree: Tree, name: string, file = "/package.json") {
    return getPackageJsonDependency(tree, name, file);
  },

  remove(tree: Tree, name: string, file = "/package.json") {
    return removePackageJsonDependency(tree, name, file);
  },

  //todo: devkit/schematics/...
  //add `npm install` task
  install(context: SchematicContext) {
    return context.addTask(new NodePackageInstallTask());
  }
};
