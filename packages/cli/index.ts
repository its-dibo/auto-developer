import * as sc from "@engineers/auto-developer/tools/schematics";
import { existsSync } from "fs";
import { join } from "path";
import { cwd } from "process";
import { execSync } from "child_process";
const dev = process.env.NODE_ENV === "development";
console.log({ dev });

export interface StartOptions {
  dvPath?: string; //path to dv config, relative to the location where the cmd executed (default ./dv.js)
}

export default function(options: StartOptions): sc.Rule {
  return (tree: sc.Tree, context: sc.SchematicContext) => {
    //todo: dv.config.json|js|ts
    if (!options.dvPath) {
      ["json", "js", "ts"].forEach(el => {
        let path = `./dv.config.${el}`;
        if (!options.dvPath && existsSync(join(cwd(), path)))
          options.dvPath = path;
      });
    }

    if (!options.dvPath) sc.error("provide dvPath", "start");
    //dvPath is relative to cwd() , i.e: where the cmd executed,
    //not relative to __dirname
    options.dvPath = join(cwd(), options.dvPath);
    if (!existsSync(options.dvPath))
      sc.error(`path to dv config is not found: ${options.dvPath}`, "start");

    //or rules=[sc.read(path)]t
    let autoDev = require(options.dvPath);
    autoDev.config = autoDev.config || {};
    autoDev.config.dev = dev;

    //todo: run every project (or account) inside a sandboxed container.
    let rules = [];
    autoDev.builders.forEach(builder => {
      //todo: merge autoDev.config & builder.config
      if (!(builder instanceof Array)) builder = [builder, {}];
      let [factory, builderOptions] = builder;
      builderOptions = builderOptions || {};

      //factory: function that returns Rule|Tree, packageName, path to collection.json, path to a function file
      //ex: [@scope/package@version:task,{options}]

      //todo: run factory without the need to list it in collection.json
      //https://github.com/angular/angular-cli/issues/17892
      //the issue appears when trying to check for tree.exists(file) after creating the file via templates.

      let rule;

      //todo: support relative paths

      if (typeof factory === "string") {
        let [path, task] = factory.split(":");

        if (path.startsWith("~")) path = `@engineers/${path.slice(1)}-builder`;
        if (!path.startsWith(".")) {
          //todo: npm install -d factory)
          //todo: support builderFactory version @scope/package@version
          //todo: also absolute paths doesn't start with '.'

          try {
            //check if the package already installed
            execSync(`npm list ${path} --silent`);
          } catch (e) {
            console.log(`>> installing ${path}`);
            execSync(
              `npm ${
                dev && path.startsWith("@engineers/") ? "link" : "i"
              } ${path}`
            );
          }
        } else if (!existsSync(path))
          sc.error(`Error: path not found ${path}`, "start");

        //factory here is a path to collection.json file (i.e using schematics)
        //schematics function accepts options only (ex: function myschematics(options):Rule{})
        //so we attach config, functionName to builderOptions.
        if (path.endsWith(".json")) {
          builderOptions.task = task;
          builderOptions.config = autoDev.config;
          rule = sc.externalSchematic(path, "runSchematics", builderOptions);
        }

        //get function from this file
        //todo: does this cause a cyclic? the builder depends on '@engineers/auto-developer' (i.e: this package)
        else factory = require(path)[task || "default"];
      }

      rule =
        rule ||
        ((tree, context) =>
          factory(tree, builderOptions, autoDev.config, context));
      rules.push(rule);
    });

    rules.push((tree, context) => {
      tree.create(
        `${autoDev.config.path}/autodev.json`,
        JSON.stringify(autoDev)
      );
    });
    return sc.chain(rules);
  };
}
