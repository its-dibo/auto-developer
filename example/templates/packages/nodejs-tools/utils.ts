import { inspect, InspectOptions } from "util";

// todo: test if this function exports module keys & work correctly
export function exportAll(module: any) {
  /* todo:
  Object.keys(module).forEach(key => {
    exports[key] = module[key];
    // todo:  export const [key] = module[key];
  });
  */
}

/**
 * formt and flatten objects before logging it in the console, instead of just showing [Object]
 * @method log
 * @param  obj          [description]
 * @param  type="error" any console method, such as log, error, warn
 *
 */

export function log(
  obj: any,
  type = "log",
  options: InspectOptions = {}
): void {
  options = Object.assign(
    {
      maxArrayLength: null,
      depth: null,
      colors: true,
      breakLength: 100
      // compact: false,
    },
    options || {}
  );
  obj = inspect(obj, options);

  console[type](obj);
}
