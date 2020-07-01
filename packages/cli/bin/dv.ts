#!/usr/bin/env node
import { execSync } from "child_process";
let argv = process.argv.slice(2);
let dvPath = argv[0] || "./dv.config.js";
let dry = argv[1] === "--dry";

//console.log({ argv });
//todo: if(!@engineers/auto-developer)install it globally (npm i -g @engineers/auto-developers)

execSync(
  `schematics @engineers/auto-developer-cli:start --dvPath=${dvPath} --dry-run=${dry}`
);
