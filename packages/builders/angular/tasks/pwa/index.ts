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
import { insert } from "@engineers/auto-developer/tools/html";
import { join, relative } from "path";

function error(msg, mark) {
  _error(msg, "angular:pwa" + mark ? `/${mark}` : "");
}

export default function(
  tree: Tree,
  options: Options, //builder option
  config, //project config
  context: SchematicContext
) {
  return chain([
    tree => {
      /*
      todo: from @angular/pwa (angular-cli/packages/angular/pwa/pwa/index.ts)
      -   if (project.extensions['projectType'] !== 'application') {
            throw new SchematicsException(`PWA requires a project type of "application".`);
          }

      -   const buildTargets = [];
          const testTargets = [];
          for (const target of project.targets.values()) {
            if (target.builder === '@angular-devkit/build-angular:browser') {
              buildTargets.push(target);
            } else if (target.builder === '@angular-devkit/build-angular:karma') {
              testTargets.push(target);
            }
          }

       */
      if (config.dev)
        console.log(">> [angular:PWA] creating files from templates");
      let defaultOptions = {
        path: config.path,
        name: config.name,
        short_name: options.name || config.name,
        description: "", //todo: get from package.json
        theme_color: "#1976d2",
        background_color: "#fafafa",
        display: "fullscreen",
        orientation: "any",
        scope: "/",
        start_url: "/",
        categories: [],
        related_applications: [],
        screenshots: [],

        //todo: create icons from project icon or from options.icon
        icons: [
          {
            src: "assets/icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png"
          },
          {
            src: "assets/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png"
          },
          {
            src: "assets/icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png"
          },
          {
            src: "assets/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png"
          },
          {
            src: "assets/icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png"
          },
          {
            src: "assets/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "assets/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png"
          },
          {
            src: "assets/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      };

      options = deepMerge(options, defaultOptions, true);
      let templatePath = relative(
        context.schematic.description.path,
        join(__dirname, `./templates`)
      );

      let manifest = { ...options };
      delete manifest.path;
      return templates(templatePath, options.path, { manifest });
    },
    tree => {
      if (config.dev) console.log(">> [angular:PWA] modifying angular.json");
      return angular(
        tree,
        {
          assets: ["src/manifest.webmanifest"],
          serviceWorker: true,
          ngswConfigPath: "ngsw-config.json"
        },
        options.name,
        `${options.path}/angular.json`,
        ["build", "test"],
        "production"
      );
    },
    tree => {
      if (config.dev) console.log(">> [angular:PWA] adding dependencies");
      let core = package.get(
        tree,
        "@angular/core",
        `${options.path}/package.json`
      );

      return package.add(
        tree,
        {
          "@angular/service-worker": core ? core.version : "9.1.9"
        },
        "",
        `${options.path}/package.json`
      );
    },
    tree => {
      if (config.dev)
        console.log(
          ">> [angular:PWA] registering ServiceWorkerModule in AppModule"
        );

      let module = findModule(tree, `${options.path}/src/app`);
      if (module) {
        addToNgModule(
          tree,
          "import",
          "ServiceWorkerModule.register('ngsw-worker.js', { enabled: true })",
          module,
          "@angular/service-worker"
        );
      } else
        console.warn(
          `cannot find a module, you have to manually add ServiceWorkerModule to the module.`
        );
      return tree;
    },
    tree => {
      if (config.dev)
        console.log(">> [angular:PWA] adding manifest to index.html");

      let indexFiles = getIndexFiles(tree, `${options.path}/angular.json`);
      indexFiles.forEach(file => {
        insert(
          tree,
          `${options.path}/${file}`,
          "head",
          `<link rel="manifest" href="manifest.webmanifest">`
        );

        insert(
          tree,
          `${options.path}/${file}`,
          "head",
          `<meta name="theme-color" content="${options.theme_color}">`
        );
      });
      return tree;
    }
  ]);
}
