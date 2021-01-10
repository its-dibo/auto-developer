const { execSync } = require("child_process"); //todo: import from core/tools/process.ts
const {
  readdirSync,
  existsSync,
  lstatSync,
  unlinkSync,
  rmdirSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  writeFileSync
} = require("fs");
const { cwd, chdir, argv } = require("process");
const { join } = require("path");
//var cpx = require("cpx"); //or ncp: https://www.npmtrends.com/copy-vs-copyfiles-vs-cp-vs-cpx-vs-ncp-vs-npm-build-tools

const dir = cwd(),
  src = join(dir, "packages"),
  dist = join(dir, "dist/packages");

//todo: use `yargs` or `inquirer` to parse argv
const task = argv.slice(2)[0] || "build"; //todo: `cmd` (i.e without --) >task cmd --arg1 --arg2

log(`running task: ${task} \n   >cwd: ${cwd()}`);
if (task == "copy") copy(...argv.slice(3));
else if (task == "build") build(...argv.slice(3));
//todo: >... build -w ==> build(true)
else if (task == "publish") publish(...argv.slice(3));
//todo: parse args >node task publish pkg1 pkg2 --v=patch ==> publish([pkg1,pkg2],v)
else if (task == "tmp") tmp(...argv.slice(3));

//------------- helpers ----------------
function cd(path) {
  //path = path ? join(dir, path) : dir; //  path = dir + path ? "/" + path : "";
  path = path || dir;
  log(`chdir ${path}`);

  //or execSync(`cd ${path}`)
  chdir(path);
}

function exec(cmd, std) {
  log(cmd);

  if (std === true) std = [0, 1, 2];
  if (std) std = { stdio: std }; //https://stackoverflow.com/a/43962747

  try {
    return execSync(cmd, std);
  } catch (err) {
    if (!std) console.error(err); //err.stdout.toString()
  }
}

function npm(cmd, silent = true, std) {
  return exec(
    `npm ${cmd} ${silent ? " --silent" : ""} --no-audit --global-style`,
    std
  );
}

function del(path, filter = el => true) {
  if (path instanceof Array) return path.forEach(p => del(p, filter));
  if (!existsSync(path) || filter(path)) return;
  if (lstatSync(path).isDirectory()) {
    readdirSync(path).forEach(file => {
      del(join(path, file), filter);
    });
    rmdirSync(path);
  } else unlinkSync(path);
}

//todo: return boolean when all operations done
function copy(from = ".", to = "./dist", filter = () => true) {
  if (from instanceof Array) return from.map(path => copy(path, to, filter));
  if (!existsSync(from)) return;

  if (lstatSync(from).isDirectory()) {
    readdirSync(from)
      //execlude node_modules, dist and *.ts (already compiles with typescript), except template files (i.e: inside **/templates/**)
      //and any file or folder starts with '.' (.git)
      //todo: if(filter !function)filter=(/filter/)=>false or execlude[]
      .filter(
        el =>
          filter(el) &&
          //not node_modules/* | dist/* | *.ts (except /templates/*.ts), .*(except .npmignore, .gitignore)
          //todo: test  /(?<!\/templates)\/.+?\.ts$/
          !/\/?node_modules\/?|\/?dist\/?|^\.(?!npmignore|gitignore)|(?<!\/templates)\/.+?\.ts$/.test(
            el
          )
      )
      .forEach(file => {
        log(file, true);
        const curFrom = join(from, file);
        const curTo = join(to, file);
        if (lstatSync(curFrom).isDirectory()) copy(curFrom, curTo, filter);
        else {
          if (!existsSync(curTo)) {
            mkdirSync(to, { recursive: true });
            copyFileSync(curFrom, curTo);
          }
        }
      });
  } else copyFileSync(from, to);

  //todo: replaceAll('./dist','./') in the whole file.
  let package = JSON.parse(readFileSync(`./package.json`, "utf8").toString());
  package.main = package.main.replace("dist/", "");
  writeFileSync(`./dist/package.json`, JSON.stringify(package));
}
function isPackage(path) {
  return existsSync(`${path}/package.json`);
}

function log(msg, sub = false) {
  if (!sub) console.log(`>> ${msg}\n`);
  else console.log(` > ${msg}`);
}
//------------- /helpers ----------------

function build(watch = false) {
  //create 'dist' (by running tsc & cpx) then pack `core` and install it into every builder

  //remove `dist` folder
  //exec("if exist dist rmdir dist /s /Q"); //will NOT remove non-empty sub-dirs
  log("deleting ./dist");
  del("./dist", el => !el.includes("node_modules"));

  //run `typescript` in the following order:
  //1- core (@engineers/auto-developers)
  //2- builders & cli (dependent on core)
  //3- other

  log("compiling typescript");
  cd(`${src}/core`);
  exec(`tsc ${watch ? "-w" : ""}`);

  cd(`${src}/cli`);
  exec(`tsc ${watch ? "-w" : ""}`);

  cd(dir);
  exec(`tsc ${watch ? "-w" : ""}`);

  /*exec(
    'start /B /MIN "compile" call tsc -p tsconfig.json ' + (watch ? "-w" : ""), // + " >dist/logs/build.log"
    true
  ); */

  //todo: wait until tsc finish

  //copy files that will don't be compiled via typescript  to `dist`
  //i.e !(*.ts) and /files/**
  //exec("npx cpx packages/**/!(*.ts) dist/packages" + (watch ? "-w" : ""));
  //todo: use regex, don't extend the glob pattern (i.e {a,b,c}) because it will make it executed multiple times, once per each element; !(a|b|c)
  //cpx.copySync("packages/**/{!(*.ts),files/**,!(node_modules/**)}","dist/packages",{includeEmptyDirs: true //include empty dirs inside files/**});
  log("copying files ..");
  copy(
    ".",
    "dist",
    el => !el.includes("node_modules") && !el.includes("dist/")
  );
  console.log("\n");

  log("installing dependencies (npm link) ...");
  cd(`${dist}/core`);
  npm(`link`);

  cd(`${dist}/cli`);
  npm("link");
  //npm("link @engineers/auto-developer");

  //link all builders packages and install '@engineers/auto-developer' inside each builder.
  readdirSync(`${dist}/builders`).forEach(builder => {
    let pkg = `${dist}/builders/${builder}`;
    if (!isPackage(pkg)) return;
    cd(pkg);

    //add a symlink to the global `node_module`.
    npm("link");
    //npm("link @engineers/auto-developer");
  });

  //install '@engineers/auto-developer' in dist/ because it used bt dv.config.js
  cd(dist);
  npm("link @engineers/auto-developer");
  //npm("link @engineers/nodejs-builder");
  //npm("link @engineers/angular-builder");

  //@engineers/auto-developer is used when executing the cmd `tsc`
  npm("link @engineers/auto-developer");
  cd(dir);
}

function publish(pkg, version) {
  if (!pkg) throw error("[publish] specify a package to publish, or use 'all'");

  //increase the version of every package then publish them
  if (!version) version = "patch";
  if (pkg === "all") {
    publish("core", version);
    publish("cli", version);
    readdirSync(`${src}/builders`).forEach(builder =>
      publish(`builders/${builder}`, version)
    );
    return;
  } else if (pkg instanceof Array)
    return pkg.foreach(el => publish(el, version));
  //todo: publish([{pkg, version}, ..], defaultVersion)

  log(`publishing: ${pkg}: ${version}`);

  //apply `npm version` to both srcPath and distDir to change package.json's `version` in the source code.
  //then apply `npm publish` to distPAth to publish the compiled files.
  let distPath = `${dist}/packages/${pkg}`,
    srcPath = `${src}/packages/${pkg}`;

  if (!isPackage(srcPath) || !isPackage(distPath))
    throw new Error(
      `[publish] ${pkg} is not a module (doesn't contain a package.json file)`
    );

  //--force: //force increasing pkg's version even if the git is not clean (i.e unstaged changes existing)
  cd(distPath);
  npm(`version ${version} --force`);
  npm("publish  --access=public", false, true);

  //set the new version in src/**/package.json
  cd(srcPath);
  npm(`version ${version} --force`);
}
