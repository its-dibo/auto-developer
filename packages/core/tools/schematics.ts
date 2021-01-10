import * as sc from "@angular-devkit/schematics";
import { InsertChange } from "@schematics/angular/utility/change";
import { objectType } from "./objects";
import { join, relative } from "path";

export * from "@angular-devkit/schematics";
export * from "@schematics/angular/utility/change";

export interface Obj {
  [key: string]: any;
}
export interface RunSchematicsOptions extends Obj {
  task: string;
  config?: Obj;
}

/**
 * converts functions from autoDev to angular schematics format
 * @method runSchematics
 * @param  options      [description]
 * @param  fn           autoDev-format function, or a list contains the function (to run the function by it's name string)
 * @return Rule
 *
 * todo: use options.autoDev={config, task}
 */
export function runSchematics(
  options: RunSchematicsOptions,
  fn: Function | Obj
) {
  let { config, task, tree, ...opts } = options || {};
  if (typeof fn !== "function") fn = fn[task];
  return (tree, context) => (fn as Function)(tree, opts, config, context);
}

export interface TemplatesOptions {
  filter?: ((filePath: string) => boolean) | null; //todo: | Rule   // Rule = path => _filter(path => true), //todo: benchmark filter=null VS filter=path=>_filter(..)
  merge?: boolean;
  files?: ((file: sc.FileEntry) => sc.FileEntry) | null;
  replace?: boolean;
}
export function templates(
  //template path, relative to the schematic factory (i.e start.ts)
  //use relative(context.schematic.description.path,join(__dirname, "./templates"))
  from: string | sc.Source | any[],
  to?: string | any[],
  vars?: any,
  options: TemplatesOptions = {},
  tree?: sc.Tree //required if(options.replace!==false)
) {
  //console.log({from,to,vars,filter,merge})

  //[__dirname+'/templates', context]
  if (from instanceof Array)
    from = relative(from[1].schematic.description.path, from[0]);
  if (typeof from === "string") from = sc.url(from);

  let rules =
    to instanceof Array
      ? to
      : [
          options.filter ? sc.filter(options.filter) : sc.noop(), //todo: noop() VS null
          sc.template(vars),
          to ? sc.move(to) : sc.noop(),
          //https://developer.okta.com/blog/2019/02/13/angular-schematics
          // fix for https://github.com/angular/angular-cli/issues/11337
          //todo: add options to override  options.override?forEach(...):noop()
          tree && options.replace !== false
            ? sc.forEach((file: sc.FileEntry) => {
                if (tree.exists(file.path))
                  tree.overwrite(file.path, file.content);
                return file;
              })
            : sc.noop(),
          options.files
            ? sc.forEach((file: sc.FileEntry) => options.files(file))
            : sc.noop()
        ];
  let tmpl = sc.apply(from, rules); //todo: allow move empty dirs
  if (options.merge === false) return tmpl;
  else return mergeTemplate(tmpl, options.merge);
}

export function mergeTemplate(tmpl, strategy: sc.MergeStrategy = "overwrite") {
  if (tmpl instanceof Array) return sc.chain(tmpl);

  if (strategy === true || strategy === "overwrite")
    strategy = sc.MergeStrategy.Overwrite;
  if (strategy === false || strategy === "error")
    strategy = sc.MergeStrategy.Error;
  else if (!strategy || strategy === "default")
    strategy = sc.MergeStrategy.Default;

  return sc.mergeWith(tmpl, strategy);
  /*  return sc.chain([
    sc.branchAndMerge(
      sc.chain([sc.mergeWith(tmpl, strategy)])
    )
  ]); */
}

export function error(msg, mark = "") {
  if (["array", "object"].includes(objectType(msg))) msg = JSON.stringify(msg);
  //todo: try-> else if(!string)msg.toString()
  throw new sc.SchematicsException(`[${mark}] ${msg}`);
}

export function transaction(
  tree: sc.Tree,
  file: string,
  //todo: typeof sc.InsertChange ??
  changes: Change | Change[],
  direction: "left" | "right" = "left"
) {
  //uppercase the first letter  https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
  direction = direction.charAt(0).toUpperCase() + direction.slice(1);
  if (!(changes instanceof Array)) (changes as Change[]) = [changes as Change];

  let recorder = tree.beginUpdate(file);
  for (let change of changes) {
    recorder[`insert${direction}`](change.pos, change.toAdd);
  }
  tree.commitUpdate(recorder);
}
