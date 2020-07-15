import * as sc from "@engineers/auto-developer/tools/schematics";
import {
  deepMerge,
  strings,
  objectType
} from "@engineers/auto-developer/tools/objects";
import { dependencies } from "@engineers/auto-developer/tools/files";
import { package, json } from "@engineers/auto-developer/tools/json";
import { existsSync } from "fs";
import { join, relative } from "path";

function error(msg, mark) {
  sc.error(msg, "angular:init");
}

export default function(
  tree: sc.Tree,
  options: Options, //builder option
  config, //project config
  context: sc.SchematicContext
) {
  let defaultOptions = {
    version: "9.1.9",
    path: config.path,
    name: config.name,
    angularCompilerOptions: {
      fullTemplateTypeCheck: true,
      strictInjectionParameters: true,
      enableIvy: true
    }
  };
  options = deepMerge(options, defaultOptions, true);

  let rules = [
    tree => {
      if (config.dev)
        console.log(`>> [angular:init] creating files from templates`);

      if (tree.exists("angular.json"))
        error("this is an existing Angular project");

      //ex: ~9.1.2-beta (major.minor.patch-label) -> 9; semver.org;  or use npm: semver
      let versionMajor = (/^~|\^/.test(options.version)
        ? //remove ~version, ^version (if we got the version from package.json)
          options.version.slice(1)
        : options.version
      ).split(".")[0];
      if (!existsSync(join(__dirname, `./templates/v${versionMajor}`)))
        error(`version ${versionMajor} is not supported`);

      let templatePath = relative(
        context.schematic.description.path,
        join(__dirname, `./templates/v${versionMajor}`)
      );

      return sc.templates(templatePath, options.path, options);
    },

    tree => {
      if (config.dev) console.log(`>> [angular:init] adding dependencies`);
      package.add(
        tree,
        {
          "@angular/animations": options.version, //todo: move '@angular/animations' to angular-builder:material?
          "@angular/common": options.version,
          "@angular/compiler": options.version,
          "@angular/core": options.version,
          "@angular/forms": options.version,
          "@angular/platform-browser": options.version,
          "@angular/platform-browser-dynamic": options.version,
          "@angular/router": options.version,
          rxjs: "~6.5.4",
          "zone.js": "~0.10.2"
        },
        "",
        `${options.path}/package.json`
      );

      return package.add(
        tree,
        {
          "@angular-devkit/build-angular": "~0.901.7",
          "@angular/cli": options.version,
          "@angular/compiler-cli": options.version
          /*
           //todo: add test dependencies by angular:test
          "@types/jasmine": "~3.5.0",
          "@types/jasminewd2": "~2.0.3",
          codelyzer: "^5.1.2",
          "jasmine-core": "~3.5.0",
          "jasmine-spec-reporter": "~4.2.1",
           karma: "~5.0.0",
          "karma-chrome-launcher": "~3.1.0",
          "karma-coverage-istanbul-reporter": "~2.1.0",
          "karma-jasmine": "~3.0.1",
          "karma-jasmine-html-reporter": "^1.4.2",
          protractor: "~7.0.0",
          */
        },
        "dev",
        `${options.path}/package.json`,
        true //to override typescript version to be compitible with angular/core version
      );
    },

    tree => {
      if (config.dev) console.log(`>> [angular:init] modifying tsconfig`);
      return json.write(
        tree,
        `${options.path}/tsconfig.json`,
        { angularCompilerOptions: options.angularCompilerOptions },
        "deepMerge"
      );
    },
    tree => {
      if (config.dev)
        console.log(`>> [angular:init] adding scripts to package.json`);
      let scripts = {
        "ng:build:browser": "ng build --prod --aot",
        "ng:build:browser:dev": "ng build",
        "ng:build:server": `ng run ${options.name}:server:production --bundleDependencies`,
        "ng:build:server:dev": `ng run ${options.name}:server --bundleDependencies`,
        "ng:build": "npm run ng:build:browser && npm run ng:build:server",
        "ng:build:dev":
          "npm run ng:build:browser:dev && npm run ng:build:server:dev",
        "ng:serve": "ng serve -o",
        "ng:prerender": `ng run ${options.name}:prerender`
      };

      return json.write(
        tree,
        `${options.path}/package.json`,
        {
          scripts: {
            "ng:build:browser": "ng build --prod --aot",
            "ng:build:browser:dev": "ng build",
            "ng:build": "npm run ng:build:browser", //&&build:server (angular:universal)
            "ng:build:dev": "npm run ng:build:browser:dev",
            "ng:serve": "ng serve -o",
            "ng:prerender": `ng run ${options.name}:prerender`
          }
        },
        "deepMerge"
      );
    }
    /*todo: angular:universal add/modify these properties to scripts.
    {
      "ng:build:server": `ng run ${options.name}:server:production --bundleDependencies`,
      "ng:build:server:dev": `ng run ${options.name}:server --bundleDependencies`,
      "ng:build": "... && npm run ng:build:server",
      "ng:build:dev":"... && npm run ng:build:server:dev",
    }
    */

    //todo: update karma.conf.js
  ];

  return sc.chain(rules);
}
