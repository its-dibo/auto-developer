import {
  resolve as _resolve,
  normalize,
  join,
  dirname,
  basename,
  extname
} from "path";
import { exportAll } from "./utils";
import { objectType, isEmpty, isNumber, isPromise } from "./objects";
import { setTimer, getTimer, endTimer, now } from "./timer";

import {
  existsSync,
  lstatSync, //same as statSync, but dosen't follow symlinks, https://www.brainbell.com/javascript/fs-stats-structure.html
  renameSync,
  readdirSync,
  unlinkSync,
  rmdirSync,
  constants,
  writeFileSync,
  mkdirSync,
  readFileSync,
  MakeDirectoryOptions,
  PathLike
} from "fs";

/*
tmp: https://github.com/webpack/webpack-cli/issues/1612
import {
  lstat,
  rename,
  readdir,
  unlink,
  writeFile,
  readFile,
  access,
  mkdir,
  rmdir
} from "fs/promises";

//todo: does 'export *' impact the bundle size?
//todo: separate fs.ts, fs-sync.ts
export * from "fs/promises";
//import * as fsSync from "fs";
//export { fsSync };
*/

const {
  lstat,
  rename,
  readdir,
  unlink,
  writeFile,
  readFile,
  access,
  mkdir,
  rmdir
} = require("fs").promises;

export { rename, unlink, readdir, writeFile };
//-------------- /tmp: webpack issue

/*
todo: export * from 'path'
//https://stackoverflow.com/a/43801887/12577650
import Path = require("./m");
export { Path };
*/

const dev = process.env.NODE_ENV === "development";

export enum MoveOptionsExisting {
  "replace",
  "rename", // todo: rename pattern ex: {{filename}}({{count++}}).{{ext}}
  "continue", // ignore
  "stop"
}
export interface MoveOptions {
  existing: MoveOptionsExisting;
}
export interface DeleteOptions {
  filesOnly?: boolean; // delete files only, don't delete folders
  keepDir?: boolean; // if false, delete the folder content, but not the folder itself, default=false
  // [name: string]: any;
}

// = string | Buffer | URL, but URL here refers to typescript/URL not node/URL

//exportAll(fs);
//exportAll(Path); // todo: check if there is any conflict betweet fs & path methods
// todo: const fs=Fs(root): auto add root to all paths

/**
 * resolves the path/paths to be absolute and normalize it to guarantee that
 *  the path seperator type of the operating system will be used consistently
 * (e.g. this will turn C:\directory/test into C:\directory\test (when being on Windows)
 * @method path
 * @param  ...paths [description]
 * @return [description]
 */
export function resolve(...paths: PathLike[]): string {
  const stringPaths = paths.map(el => el.toString());
  return _resolve(normalize(join(...stringPaths))); // if it null it will be the current working dir (of the working script)
}

export function parsePath(path) {
  let extension = ext(path);
  return {
    type: isDirSync(path) ? "dir" : "file",
    dir: dirname(path),
    file: basename(path, extension),
    extension
  };
}

/**
 * get file extension
 * @method ext
 * @param  file [file path]
 * @return [description]
 */
// TODO: if(file[0]=='.' && no other ".")return file ex: .gitignore
// todo: remove `.` from extention
//or: file.split(".").pop().toLowerCase()
export function ext(file: PathLike): string {
  if (typeof file != "string") return null;
  return extname(file).toLowerCase();
}

export function size(
  path?: PathLike,
  unit: "b" | "kb" | "mb" | "gb" = "b"
): Promise<number> {
  return lstat(path)
    .then(stats => stats.size)
    .then(size => {
      if (unit === "kb") return size / 1024;
      else if (unit === "mb") return size / (1024 * 1024);
      else if (unit === "gb") return size / (1024 * 1024 * 1024);
      else return size;
    });
}

export function sizeSync(
  path?: PathLike,
  unit: "b" | "kb" | "mb" | "gb" = "b"
): number {
  let size = lstatSync(path).size;
  if (unit === "kb") return size / 1024;
  else if (unit === "mb") return size / (1024 * 1024);
  else if (unit === "gb") return size / (1024 * 1024 * 1024);
  else return size;
}

export function isDir(path: PathLike): Promise<boolean> {
  return lstat(path).then(stats => stats.isDirectory());
}
export function isDirSync(path: PathLike): boolean {
  return !existsSync(path) ? null : lstatSync(path).isDirectory();
}

export function mtime(file: PathLike): Promise<number> {
  return lstat(file).then(stats => stats.mtimeMs);
}

export function mtimeSync(file: PathLike): number {
  return lstatSync(file).mtimeMs;
}

/*
todo:
 - move multiple files:  move([ ...[from,to,options] ], globalOptions)
 - if isDir(newPath)newPath+=basename(path)
 - bulk: move({file1:newPath1, file2:newFile2}) or move([file1,file2],newPath)
 - move directories and files.
 - if faild, try copy & unlink
 - options.existing: replace|rename_pattern|continue
 */
function move(path: PathLike, newPath: PathLike, options?: MoveOptions) {
  //todo: mdir(path).then->fsp.rename()
  return rename(path, newPath);
}

function moveSync(path: PathLike, newPath: PathLike, options?: MoveOptions) {
  return renameSync(path, newPath);
}

/*
 delete files or folders recursively  https://stackoverflow.com/a/32197381

 todo:
  - options?: { [name: string]: any }:
      outer: if false, only remove folder contains but don't remove the folder itself (affects folders only)
      files: if true, only remove files (nx: dirs:false|empty false:don't remove dirs, empty=only remove empty dirs)

   https://stackoverflow.com/questions/42027864/is-there-any-way-to-target-the-plain-javascript-object-type-in-typescript

 - after removing all files, remove path
     readdir(path,{},files=>{files.foreach(..); unlink(path)}), use promises
     https://stackoverflow.com/questions/18983138/callback-after-all-asynchronous-foreach-callbacks-are-completed
     https://gist.github.com/yoavniran/adbbe12ddf7978e070c0
     or: remove all files and add dirs to dirs[], then remove all dirs

 */
export function remove(path: string, options?: DeleteOptions): Promise<boolean>;
export function remove(
  path: string[],
  options?: DeleteOptions
): Promise<{ [path: string]: any }>;

export function remove(
  path: string | string[],
  options
): Promise<boolean | { [path: string]: any }> {
  if (!path) return Promise.reject("no path");
  if (path instanceof Array)
    return Promise.all(path.map(p => ({ [p]: remove(p as string, options) })));

  return (
    access(path, constants.R_OK)
      .then(() => isDir(path as string))
      .then(_isDir => {
        if (_isDir)
          return (
            readdir(path)
              .then(files =>
                Promise.all(
                  files.map(file => {
                    let curPath = `${path}/${file}`;
                    return isDir(curPath).then(_isDir2 => {
                      if (!_isDir2) return unlink(curPath).then(() => true); //todo: {[file]: unlink()}
                      if (!options.filesOnly) return remove(curPath, options);
                    });
                  })
                )
              )
              //make both values (i.e: return from if(_isDir) & else) of same type, for example 'boolean'
              .then(() => true)
          );
        else return unlink(path).then(() => true);
      })
      .then(() => {
        //.then(results=>{})
        if (!options.keepDir) return rmdir(path);
      })
      //todo: or {file: boolean}
      .then(() => true)
      .catch(() => false)
  );
}

export function removeSync(
  path: string | string[],
  options?: DeleteOptions
): boolean | { [path: string]: any } {
  if (!path) return false; //todo: throw error
  if (path instanceof Array)
    return path.map(p => ({ [p]: remove(p as string, options) }));

  path = <string>path;
  path = resolve(path);
  options = options || {};

  if (existsSync(path)) return false;

  if (isDirSync(path))
    readdirSync(path).forEach(file => {
      let curPath = `${path}/${file}`;
      if (isDirSync(curPath)) {
        if (!options.filesOnly) remove(curPath, options);
      } else unlinkSync(curPath);
    });
  else unlinkSync(path);
  if (!options.keepDir) rmdirSync(path);
}

export function write(file: PathLike, data: any, options?: any): Promise<void> {
  file = resolve(file);
  return mdir(file as string, true)
    .then(() =>
      ["array", "object"].includes(objectType(data))
        ? JSON.stringify(data)
        : data
    )
    .then(dataString => writeFile(file, dataString, options));
  //.then-> {file,data}
}

export function writeSync(
  file: PathLike,
  data: any,
  options?: any //todo: options?:WriteFileOptions
): void {
  file = resolve(file);
  mdirSync(file as string, true);
  let dataString = ["array", "object"].includes(objectType(data))
    ? JSON.stringify(data)
    : data;
  //todo: if(JSON.stringify error)->throw error

  return writeFileSync(file, dataString, options);
}

/**
 * cache data into a file, or read the cache file if the data is fresh
 * @method cache
 * @param  file       [description]
 * @param  data       [description]
 * @param  expire     in hours
 * @param  type       [description]
 * @param  allowEmpty allow creating an empty cache file
 * @return Promise<data:any>;  returns a promise (because some operations executed in async mode) , use await or .then()
  todo:
  - strategy -> in case of no valid cache & faild to get data, return:
               - the most recent cache file
               - the nearest valid cache file in files[] array in order
  - all functions inside cache() must use the async version
    ex: replace mdirSync() with mdir().then()

 */
export async function cache(
  files: string | string[], //todo: PathLike | PathLike[]
  data?: any,
  expire = 0,
  maxAge = 0,
  type?,
  allowEmpty = false
): Promise<any> {
  setTimer("cache");

  if (!(files instanceof Array)) files = [files];
  files = files.map(file => resolve(file));

  if (data === ":purge:")
    return Promise.all(files.map(file => ({ [file]: unlink(file) })));

  let readCache = function(file) {
    if (!type) {
      if (ext(file) == ".json") type = "json";
      else if (
        //todo: list all media types
        [".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp3", ".mp4"].includes(
          ext(file)
        )
      )
        type = "buffer";
    }

    if (type == "buffer") data = readFile(file);
    else {
      // without encoding (i.e utf-8) will return a stream instead of a string
      data = readFile(file, "utf8").then(data => {
        data = data.toString();
        if (type === "json") data = JSON.parse(data);
        return data;
      });
    }

    return data.then(data => {
      if (dev) console.log("[cache] file exists", endTimer("cache"), file);
      return data;
    });
  };

  let filesInfo = {}; //contains exists files only with mtime for each file.

  let _now = now();

  for (let i = 0; i < files.length; i++) {
    if (existsSync(files[i])) {
      filesInfo[files[i]] = mtimeSync(files[i]) as number;

      if (
        expire > -1 &&
        (expire == 0 || filesInfo[files[i]] + expire * 60 * 60 * 1000 > _now)
      )
        return readCache(files[i]);
    }
  }

  //if there is no valid file, run data()
  if (dev) console.log("[cache] refreshing", files[0]);
  mdirSync(files[0] as string, true); //todo: replace with mdir().then()

  //todo: also support rxjs.Observable
  //no need to support Async functions, because it is nonsense if data() function returns another function. (func.constructor.name === "AsyncFunction")
  //todo: await dosen't work if the function returned cache()
  //  ex: cache(file2.txt, ()=>cache(file1.txt, ()=>Promise.resolve('data')).then(data=>'data changed')  )
  //  we get file1.txt from cache, then changed data, then saved the new data into file2.txt
  if (typeof data === "function") data = /* await*/ data();

  let p = isPromise ? data : Promise.resolve(data);

  return p
    .then(data => {
      if (allowEmpty || !isEmpty(data)) write(files[0], data);
      if (dev)
        console.log("[cache] refereshed in", endTimer("cache"), files[0]);
      return data; //todo: return write()
    })
    .catch(error => {
      if (dev)
        console.warn(
          "[cache] faild to refresh the cache" +
            (maxAge > -1
              ? ", trying to get data from any valid cache file"
              : ""),
          getTimer("cache"),
          error
        );

      if (maxAge > -1) {
        for (let k in filesInfo) {
          if (maxAge == 0 || filesInfo[k] + maxAge * 60 * 60 * 1000 > _now)
            return readCache(k);
        }
      }

      return Promise.reject("[cache] cannot fetch any data");
    });
}

export function mdir(
  path: string | string[],
  file = false,
  options: number | string | MakeDirectoryOptions = {}
): Promise<any> {
  if (path instanceof Array)
    return Promise.all(path.map(p => ({ [p]: mdir(p, file) })));

  if (file) path = dirname(path);
  if (typeof options === "string" || isNumber(options))
    options = <MakeDirectoryOptions>{ mode: <number | string>options };

  if (!("recursive" in <MakeDirectoryOptions>options))
    (<MakeDirectoryOptions>options).recursive = true;

  return access(path, constants.R_OK).then(() =>
    mkdir(<string>path, <MakeDirectoryOptions>options)
  );
}

//todo: return boolean | {[file:string]: any}
export function mdirSync(
  path: string | string[],
  file = false,
  options: number | string | MakeDirectoryOptions = {}
) {
  if (path instanceof Array) return path.map(p => ({ [p]: mdirSync(p, file) }));

  if (file) path = dirname(path);
  if (typeof options === "string" || isNumber(options))
    options = <MakeDirectoryOptions>{ mode: options };

  if (!("recursive" in <MakeDirectoryOptions>options))
    (<MakeDirectoryOptions>options).recursive = true;

  existsSync(path) || mkdirSync(path, { recursive: true });
  //todo: return boolean
}

//todo: replace with read() & write()
export let json = {
  read(file: string) {
    if (!file) return null;
    var data = readFileSync(file).toString();
    return JSON.parse(data || null);
  },
  write(file: string, data: any, cb?) {
    return write(file, data, cb);
  },
  convert(data: any) {
    if (typeof data == "string") {
      if (ext(data) == ".json") return this.read(data);
      if (data.trim().charAt(0) == "{") return JSON.parse(data) || null;
    } else {
      return JSON.stringify(data);
    }
  }
};

export function read() {}

/*
todo:
- extend the native "fs": add methods to it (i.e: fs.newMethod=fn(){..}) then re export it
- add this.root to paths in all methods
- provide file path to all methods, to avoid creating a new instance for every file
  i.e new file(path).size() -> new file().size(path)
  if path didn't provided, this.filePath will be used
*/
/*
export class Files {
//accepts the root path as the root base for all paths in this class
  constructor(public root: PathLike) {
    console.log("===Files()==="); //todo: remove all logs, use unit test
    this.root = this.path(root);
    return this;
  }
}
*/
