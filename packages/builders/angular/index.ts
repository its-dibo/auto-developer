import {
  runSchematics as _runSchematics,
  RunSchematicsOptions
} from "@engineers/auto-developer/tools/schematics";
import init from "./tasks/init";
import material from "./tasks/material";
import pwa from "./tasks/pwa";
import firebase from "./tasks/firebase";

export function runSchematics(options: RunSchematicsOptions) {
  return _runSchematics(options, list);
}

let list = { init, material, pwa, firebase };
export { init, material, pwa, firebase };
export default init;
