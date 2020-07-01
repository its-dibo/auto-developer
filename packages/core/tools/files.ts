import * as sc from "./schematics";
import { objectType, merge } from "./objects";

//import stripJsonComments from "strip-json-comments";

export * from "@schematics/angular/utility/parse-name";
export * from "@schematics/angular/utility/paths";
export * from "@schematics/angular/utility/json-utils";

function error(msg, mark = "") {
  sc.error(msg, "tools/files" + mark ? `/${mark}` : "");
}

export type JsonData = { [key: string]: any }; //todo: | (kay: string) => any
export type Strategy =
  | "replace" //replace the existing file
  | "skip" //don't replace, but don't throw an exception
  | "error" //throw an exception
  | "append" //append the new data to the existing content
  | "prepend";

export function read(
  tree: sc.Tree,
  file: string,
  enc: string = "utf-8"
): string {
  if (!tree) error("tree is required", `insert(${file})`);
  if (!file) error("file is required", `insert(${file})`);

  if (!tree.exists(file)) return null;
  //throw new sc.SchematicsException(`${file} is not existing`);
  try {
    let content = tree.read(file)!.toString(enc);
    return file.endsWith(".json") ? JSON.parse(content) : content;
  } catch (e) {
    error(`error: Cannot read file ${file}: ${e.message}`, "read()");
  }
}

export function write(
  tree: sc.Tree,
  file: string,
  data: any,
  strategy: Strategy = "replace"
): Rule {
  if (!tree.exists(file)) return tree.create(file, data);
  else if (strategy === "replace") return tree.overwrite(file, data);
  else if (strategy === "error") error(`${file} already exists`, "write()");
  else if (strategy === "append" || strategy === "prepend") {
    let existingData = read(tree, file);
    if (existingData) {
      if (strategy === "append") data = existingData + data;
      else data = existingData + data;
    }
    return tree.overwite(file, data);
  }

  //skip
  return tree;
}

/*
deprecated! replaced with ./json -> package{}
//update package.json
export function pkg(
  tree: sc.Tree,
  path: string,
  data: JsonData,
  mergeOptions: MergeOptions = "merge",
  keyMergeOptions: MergeOptions = "merge"
) {
  if (!path)
    error("provide a path to package.json file, or project's root", "pkg()");
  if (!path.endsWith("package.json")) path += "/package.json";
  return json.write(tree, path, data, mergeOptions, keyMergeOptions);
}

//todo: all dependencies types
export type DependenciesType = "" | "dev" | "peer";

//add dependencies, todo: use the official schematics/utilities/addToDependencies
//todo: if a dependency already exists, just update it's version
//todo: use addPackageJsonDependency from @schematics/angular
export function dependencies(
  tree: sc.Tree,
  path: string,
  data: JsonData,
  type: DependenciesType = "",
  mergeOptions: MergeOptions = "merge",
  keyMergeOptions: MergeOptions = "merge"
): sc.Rule {
  if (type == "dev") data = { devDependencies: data };
  else if (type == "peer") data = { peerDependencies: data };
  else data = { dependencies: data };
  return pkg(tree, path, data, mergeOptions, keyMergeOptions);
}

*/
