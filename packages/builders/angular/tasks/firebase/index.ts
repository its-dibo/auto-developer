import {
  Tree,
  SchematicContext,
  chain,
  templates,
  error as _error
} from "@engineers/auto-developer/tools/schematics";
import {
  angular,
  addToNgModule,
  findModule,
  getIndexFiles
} from "@engineers/auto-developer/tools/angular";
import { deepMerge } from "@engineers/auto-developer/tools/objects";
import { package, json } from "@engineers/auto-developer/tools/json";
import { addImport } from "@engineers/auto-developer/tools/typescript";
import { insert } from "@engineers/auto-developer/tools/html";
import { join, relative } from "path";

function error(msg, mark) {
  _error(msg, "angular:firebase" + mark ? `/${mark}` : "");
}

export default function(
  tree: Tree,
  options: Options,
  config,
  context: SchematicContext
) {
  return chain([
    tree => {
      if (config.dev)
        console.log(">> [angular:firebase] creating files from templates");
      let defaultOptions = {
        path: config.path,
        name: config.name, //firebase project name as created via firebase dashboard
        dist: "dist",
        //the folder that contain 'firebase' logic, to install firebase packages in the project's root use source:.
        source: "firebase",
        language: "typescript",
        //todo: add engine:{node:*}
        node: 8,
        rules: {
          database: { ".read": false, ".write": false },
          firestore: {
            indexes: [],
            fieldOverrides: [],
            version: 2,
            rules: `
         match /databases/{database}/documents {
          match /{document=**} {
            allow read, write;
          }
        }`
          },
          storage: {
            version: 2,
            rules: `
       match /b/{bucket}/o {
         match /{allPaths=**} {
           allow read, write: if request.auth!=null;
        }
      }`
          }
        }
      };
      options = deepMerge(options, defaultOptions, true);
      options.public = options.public || options.dist;
      options.main = options.main || `${options.dist}/index.js`;

      let templatePath = relative(
        context.schematic.description.path,
        join(__dirname, `./templates/${options.language}`)
      );

      //todo: move to options.path/options.source (ex: project/firebase, project/.)
      return templates(templatePath, options.path, { options });
    },
    tree => {
      if (config.dev) console.log(">> [angular:firebase] adding dependencies");

      //todo: select versions based on firebase version
      package.add(
        tree,
        {
          firebase: "^7.14.6",
          "@angular/fire": "^6.0.0"
        },
        "",
        `${options.path}/package.json`
      );

      package.add(
        tree,
        {
          "firebase-admin": "^8.6.0",
          "firebase-functions": "^3.3.0"
        },
        "",
        `${options.path}/firebase/package.json`
      );

      return package.add(
        tree,
        {
          "firebase-functions-test": "^0.1.6"
        },
        "dev",
        `${options.path}/firebase/package.json`
      );
    },
    //todo: add firebase:* scripts, ex: firebase:deploy,...
    tree => {
      if (config.dev)
        console.log(`>> [angular:firebase] adding scripts to package.json`);
      return json.write(
        tree,
        `${options.path}/package.json`,
        {
          scripts: {
            "firebase:build": "tsc -p firebase/tsconfig.json",
            "firebase:token": "firebase login:ci"
          }
        },
        "deepMerge"
      );
    }
  ]);
}
