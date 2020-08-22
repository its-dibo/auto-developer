//this file just fro testing builders and not part of the core package
//copy it to your workspace (i.e: where all projects will be created) and modify it,
//then run >dv

import { join, relative } from "path";
import * as sc from "@engineers/auto-developer/tools/schematics";
import { json } from "@engineers/auto-developer/tools/json";
import { addImports } from "@engineers/auto-developer/tools/typescript";

const name = "example",
  path = "projects/example";

export interface Options extends sc.Obj {}

export interface AutoDev {
  config: {
    path: string;
    name?: string;
    signal?: string; //default init
    manager?: string; //default npm
    [key: string]: any;
  };
  builders: any[]; //todo: [factory: function|string, options:{}];
}

const autoDev: AutoDev = {
  config: {
    path,
    name,
    signal: "init",
    manager: "npm",
    store: join(__dirname, "./builders")
  },
  //todo: support useing tsconfig paths aliases ex: @scope/packageName -> ../builders/packageName
  //https://mitchellsimoens.com/2019/08/07/why-typescript-paths-failed-me/
  builders: [
    [
      "~nodejs",
      {
        ts: {
          compileOnSave: false,
          compilerOptions: {
            baseUrl: "./",
            outDir: "./dist",
            target: "es2015",
            module: "esnext",
            moduleResolution: "node",
            sourceMap: true,
            declaration: false,
            downlevelIteration: true,
            experimentalDecorators: true,
            importHelpers: true,
            types: ["node"],
            typeRoots: ["node_modules/@types"],
            lib: ["es2018", "dom"],
            removeComments: true,
            noEmit: false,
            noEmitOnError: false,
            strict: false,
            noImplicitAny: false,
            noUnusedLocals: false,
            noUnusedParameters: false,
            noImplicitReturns: false,
            paths: {
              "*": ["node_modules/*", "types/*"]
            },
            rootDir: "./",
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
            preserveSymlinks: true,
            sourceRoot: "",
            mapRoot: "",
            emitDecoratorMetadata: true,
            locale: "en",
            watch: false,
            resolveJsonModule: true
          },
          angularCompilerOptions: {
            fullTemplateTypeCheck: true,
            strictInjectionParameters: true,
            enableIvy: true
          }
        }
      }
    ],
    ["~angular", {}],
    ["~angular:material", { theme: "deeppurple-amber" }],
    ["~angular:pwa"],
    [
      "~angular:firebase",
      {
        name: "example-web",
        dist: "../dist/firebase",
        public: "../dist",
        config: {
          apiKey: "AIzaSyBSaQPKf9q-fER2V85_5UXvpM_7-5ydWDY",
          authDomain: "example-f9e11.firebaseapp.com",
          databaseURL: "https://example-f9e11.firebaseio.com",
          projectId: "example-f9e11",
          storageBucket: "example-f9e11.appspot.com",
          messagingSenderId: "962970228513",
          appId: "1:962970228513:web:1a5a6c5ded8f1d5c8ad060"
        }
      }
    ],
    [
      tree =>
        json.write(
          tree,
          `${path}/package.json`,
          {
            scripts: {
              build:
                "npx cross-env NODE_ENV=production npm run ng:build && npm run firebase:build",
              "build:dev":
                "npx cross-env NODE_ENV=development npm run ng:build:dev && npm run firebase:build",
              serve: "node dist/server/express.js --start",
              "serve:inspect": "node --inspect dist/server/express.js --start",
              "serve:dev": "nodemon --inspect dist/server/express.js --start",
              start: "npm run build && node task optimize && npm run serve",
              "start:dev": "npm run build:dev && npm run serve:inspect",
              "start:nodemon":
                'nodemon  src/ -e ts,html,scss --exec "npm run start:dev"'
            }
          },
          "deepMerge"
        )
    ],
    [
      //todo: add {pkg/*: ./packages/*} to tconfig.paths
      (tree: sc.Tree, options: Options, config, context: sc.SchematicContext) =>
        sc.templates(
          relative(
            context.schematic.description.path,
            join(__dirname, `./templates/packages`)
          ),
          `${path}/packages`,
          {},
          { replace: true },
          tree
        )
    ],
    //temp: firebase push notifications functions added manually.
    [
      (
        tree: sc.Tree,
        options: Options,
        config,
        context: sc.SchematicContext
      ) => {
        return sc.chain([
          sc.templates(
            relative(
              context.schematic.description.path,
              join(__dirname, `./templates/firebase-push-notifications`)
            ),
            path,
            {},
            { replace: true },
            tree
          ),
          tree =>
            addImports(
              tree,
              `${path}/src/app/app.component.ts`,
              {
                firebaseConfig: "../config/firebase.js"
              },
              true
            )
        ]);
      }
    ]
  ]
};

//if 'export default' used, we will need to use require('dv.js').default
//this is equivelent to module.exports{} in js
export = autoDev;
