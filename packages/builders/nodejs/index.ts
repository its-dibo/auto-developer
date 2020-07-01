import { runSchematics as _runSchematics } from "@engineers/auto-developer/tools/schematics";
import init from "./tasks/init";

export function runSchematics(options: RunSchematicsOptions) {
  return _runSchematics(options, list);
}

let list = { init };
export { init };

//the default schematics is init
export default init;
