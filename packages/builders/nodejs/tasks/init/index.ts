import * as sc from "@engineers/auto-developer/tools/schematics";
import {
  merge,
  deepMerge,
  strings
} from "@engineers/auto-developer/tools/objects";
import { packages } from "@engineers/auto-developer/tools/json";

export interface Options {
  name: string;
  path?: string;
  keywords?: string[];
  author?: string | { name: string; email: string; url: string };
  repository?: string | { url: string; type: string };
  repo?: string | { url: string; type: string };
  homepage?: string;
  bugs?: string;
  dependencies?: string[] | { string: string };
  devDependencies?: string[] | { string: string };
  ts?: {};
  gitignore?: {};
  npmignore?: {};
  readMe?: string;
  [key: string]: any; //add arbitrary data to package.json, to create or modify other files use files-builder builder
}

export default function(
  tree: sc.Tree,
  options: Options, //builder option
  config, //project config
  context: sc.SchematicContext
) {
  let defaultOptions = {
    name: config.name,
    path: config.path,
    version: "1.0.0",
    private: false,
    description: "created by `auto-developer` goblinsTech.com/auto-developer",
    main: "index.js",
    scripts: { build: "tsc -w" },
    repository: {
      type: "",
      url: ""
    },
    keywords: ["auto-developer builder"],
    license: "MIT",
    dependencies: {},
    devDependencies: {},
    author: {
      name: "",
      email: "",
      url: ""
    }
  };

  options = deepMerge(options, defaultOptions, true);

  if (options.scope) {
    options.name = options.scope + "/" + options.name;
    delete options.scope;
  }

  var {
    ts,
    tslint,
    gitignore,
    npmignore,
    readMe,
    dependencies,
    devDependencies,
    ...opt
  } = options;

  let path = options.path;

  //to add more files (or modify an existing file) use files-builder=> [{fileName:content}]

  if (ts !== null) {
    //the user may dosen't want to use typescript

    //todo: default tsconfig
    ts = deepMerge(ts, {}, true);

    tslint = deepMerge(
      tslint,
      {
        extends: "tslint:recommended",
        //rules: https://palantir.github.io/tslint/rules/
        rules: {
          "member-ordering": [
            true,
            {
              order: [
                "static-field",
                "instance-field",
                "static-method",
                "instance-method"
              ]
            }
          ]
        },
        rulesDirectory: ["codelyzer"] //https://palantir.github.io/tslint/usage/configuration/
      },
      tslint,
      true
    );

    //todo: add version
    devDependencies = merge(
      devDependencies,
      {
        typescript: "",
        tslint: "",
        tslib: "",
        "ts-node": "",
        "@types/node": ""
      },
      true
    );

    if (
      !("codelyzer" in devDependencies) &&
      "rulesDirectory" in tslint &&
      "codelyzer" in tslint.rulesDirectory
    )
      devDependencies.codelyzer = "";
    //todo: foreach(tslint.rulesDirectory as rule)devDependencies[rule]=""; only if not a path ex: ./dir
  }

  if (gitignore instanceof Array) gitignore = gitignore.join("\n");
  if (npmignore instanceof Array) npmignore = npmignore.join("\n");

  //adjust the options
  opt.keywords = opt.keywords || ["auto-developer"];
  if (!opt.keywords.includes("auto-developer"))
    opt.keywords.unshift("auto-developer");
  //console.log("keywords", options.keywords);

  if (!opt.repository) opt.repository = opt.repo;
  delete opt.repo;

  //todo: repo may be a string i.e: "type:url" ex: "github:flaviocopes/testing"
  if (
    !opt.bugs &&
    opt.repository &&
    opt.repository.url &&
    opt.repository.type == "git"
  )
    opt.bugs = opt.repository.url + "/issues";

  opt.name = strings.dasherize(opt.name);

  if (opt.author instanceof Object) {
    //[] is also an instanceof Object, but we don't need to check because author here is {} or string
    opt.author =
      (opt.author ? opt.author.name : "") +
      (opt.author && opt.author.name ? " <" + opt.author.email + ">" : "") +
      (opt.author && opt.author.url ? " (" + opt.author.url + ")" : "");
  }

  //todo: dependencies: [mydep@1.0.0] => {mydep:1.0.0}, [mydep] => {mydep:""}

  //take the files from './files' and apply templating (on path and content)
  // of each file

  //todo: if the cmd started from onother drive than templates location, path.relative() will return the absolute path
  //https://github.com/angular/angular-cli/issues/17921
  return sc.chain([
    tree => {
      if (config.dev)
        console.log(`>> [nodejs:init] creating files from templates`);
      return sc.templates(
        [`${__dirname}/templates`, context],
        path,
        {
          opt,
          ts,
          tslint,
          gitignore,
          npmignore,
          readMe /*,...strings*/
        },
        {
          //todo: TypeError: Cannot use 'in' operator to search for 'Symbol(schematic-tree)' in true
          filter: filePath =>
            ((filePath != "tsconfig.json" && filePath != "tslint.json") ||
              ts != null) &&
            (filePath != ".npmignore" || npmignore != null) &&
            (filePath != ".gitignore" || gitignore != null) &&
            (filePath != "README.md" || readMe != null)
          /*files: file => {
          //tree.exists() here will return false, as template files didn't merged into the tree yet.
          if (tree.exists(file.path)) {
            let fileName = file.path.replace(`/${path}/`, "");
            if (fileName.startsWith("_"))
              tree.rename(file.path, `${path}/.${fileName.slice(1)}`);
          }
          return file;
        } */
        }
      );
    },
    tree => {
      if (config.dev) console.log(`>> [nodejs:init] renaming '.' files`);
      //sc.forEach(files=>{}), wirks inside sc.apply(sc.url(..),[ ->here<- ])
      ["_editorconfig", "_gitignore", "_npmignore"].forEach(el => {
        if (tree.exists(`${path}/${el}`))
          tree.rename(`${path}/${el}`, `${path}/.${el.slice(1)}`);
      });
      return tree;
    },
    tree => {
      if (config.dev) console.log(`>> [nodejs:init] adding dependencies`);
      let dep = { "@types/node": "^12.11.1" };
      if (ts !== null) {
        dep["typescript"] = "~3.8.3";
        dep["tslib"] = "^1.10.0";
      }
      return packages.add(tree, dep, "dev", path);
    }
  ]);
}
