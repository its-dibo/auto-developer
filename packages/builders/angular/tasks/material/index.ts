//todo: check @angular/material (angular/components/src/material/schematics/ng-add/setup-project.ts)

import * as sc from "@engineers/auto-developer/tools/schematics";
import { deepMerge } from "@engineers/auto-developer/tools/objects";
import { read } from "@engineers/auto-developer/tools/files";
import { json, package } from "@engineers/auto-developer/tools/json";
import { insert, addAttribute } from "@engineers/auto-developer/tools/html";
import {
  angular,
  getIndexFiles
} from "@engineers/auto-developer/tools/angular";
import { join } from "path";

import {
  addToNgModule,
  getWorkspace,
  findModule
} from "@engineers/auto-developer/tools/angular";
import { addImport } from "@engineers/auto-developer/tools/typescript";
import { existsSync } from "fs";

function error(msg, mark) {
  sc.error(msg, "angular:material" + mark ? `/${mark}` : "");
}

export default function(
  tree: sc.Tree,
  options: Options,
  config,
  context: sc.SchematicContext
) {
  let rules = [
    tree => {
      if (config.dev) console.log(`>> [angular:material] preparing options`);
      options.path = options.path || config.path;
      let core = package.get(
        tree,
        "@angular/core",
        `${options.path}/package.json`
      );

      //todo: await getWorkspace()
      let workspace = getWorkspace(tree);
      if (workspace.projects) {
        let project =
          workspace.projects[options.name || workspace.defaultProject];
        console.log({ workspace, projects, project });
      }

      let defaultOptions = {
        //todo: for @angular/core@9.1.x use @angular/ckd@9.2.4 because there is no version 9.1.X
        //versions = {$core.version: $material.version} ex:  {9.1.9: 9.2.4} or {9: 9.2.4}
        version: core ? core.version : "9.2.4",
        name: config.name, //todo: || Object.keys(workspace.projects)[0],
        animations: true
      };
      options = deepMerge(options, defaultOptions, true);

      /*
      don't check for  tree.exists('angular.json') here, put it inside a rule (i.e tree=>Rule)
      and chain it with other rules
      https://github.com/angular/angular-cli/issues/17892
      https://stackoverflow.com/questions/62290663/check-if-a-file-created-by-templates
      https://stackoverflow.com/questions/59629079/angular-schematics-apply-rules-to-the-current-tree-and-then-modify-the-tree
     */
      if (!tree.exists(`${options.path}/angular.json`))
        error("No Angular project found");
      return tree;
    },

    tree => {
      if (config.dev) console.log(`>> [angular:material] adding dependencies`);
      return package.add(
        tree,
        {
          "@angular/material": options.version,
          "@angular/cdk": options.version
        },
        "",
        `${options.path}/package.json`
      );
    },

    tree => {
      if (options.theme) {
        if (config.dev)
          console.log(`>> [Angular:material] adding material theme`);

        return angular(
          tree,
          {
            styles: [
              `./node_modules/@angular/material/prebuilt-themes/${options.theme}.css`
            ]
          },
          options.name,
          `${options.path}/angular.json`,
          ["build", "test"]
        );
      }
    },
    tree => {
      if (options.typography !== false) {
        if (config.dev) console.log(`>> [Angular:material] adding typography`);
        getIndexFiles().forEach(file =>
          addAttribute(
            tree,
            `${options.path}/${file}`,
            "body",
            "class",
            "mat-typography"
          )
        );
      }

      //todo: await addAttribute()? test: addAtribute() is sync?
      return tree;
    },

    tree => {
      if (options.animations) {
        if (config.dev)
          console.log(`>> [Angular:material] adding browser animations`);
        let module = findModule(tree, `${options.path}/src/app`);
        if (module) {
          //no need to use addImport(), as addToNgModule() uses it internally.
          //addImport(tree, "@angular/core", module, "BrowserAnimationsModule");
          addToNgModule(
            tree,
            "import",
            "BrowserAnimationsModule",
            module,
            "@angular/platform-browser/animations"
          );
        } else
          console.warn(
            `cannot find a module, you have to manually add animations to the module.`
          );
      }

      //todo: await addToNgModule()?
      return tree;
    },
    tree => {
      if (config.dev) console.log(`>> [Angular:material] adding fonts`);
      let indexFiles = getIndexFiles();
      if (indexFiles.length) {
        [
          "https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap",
          "https://fonts.googleapis.com/icon?family=Material+Icons"
        ].forEach(font => {
          indexFiles.forEach(file => {
            insert(
              tree,
              `${options.path}/${file}`,
              "head",
              `<link href="${font}" rel="stylesheet">`
            );
          });
        });
      }

      //todo: await insert()?
      return tree;
    }
  ];

  return sc.chain(rules);
}
