export * from "@angular-devkit/core"; //{ strings, normalize }

export interface Obj {
  [key: string]: any;
}

export function objectType(obj: any): string {
  //from: eldeeb/src/index.ts https://github.com/goblins-tech/eldeeb/blob/master/src/index.ts
  //todo: move to @eldeeb/utils
  return Object.prototype.toString
    .call(obj)
    .replace("[object ", "")
    .replace("]", "")
    .toLowerCase();
  /*
    examples:
   {} => object
   [] => array
   null => null
   function(){} => function
   1 => number
   "x", 'x', `x` => string
   */
}

//merge obj2 with obj1, remove null values (ex: {x:null} -> remove x from obj2)
//obj1 overrides obj2 (ex: merge(options, defaultOptions))
//todo: merge(...objects, removeNull:boolean)
export function merge(obj1: any = {}, obj2: any = {}, removeNull = false) {
  //options=options||{};
  //note: also ([] instanceof Object)->true; (Array instanceof Object)->true
  let type = objectType(obj1);

  if (type === "object") {
    obj1 = Object.assign(obj2 || {}, obj1 || {});

    if (removeNull) {
      for (let k in obj1) {
        if (
          obj1.hasOwnProperty(k) &&
          (obj1[k] === null || obj1[k] === undefined)
        )
          delete obj1[k];
      }
    }
  } else if (type === "array") {
    //todo: remove duplicates
    //todo: if (obj2 instanceof Array||Set)
    if (obj2 instanceof Array) obj1 = obj1.push(...obj2);
    else obj1 = obj1.push(obj2);

    if (removeNull) obj1.filter(el => el !== null && el !== undefined);
  } else if (obj1 === undefined) obj1 = obj2;

  return obj1;
}

export function deepMerge(obj1: any = {}, obj2: any = {}, removeNull = false) {
  if (objectType(obj1) === "object" && objectType(obj2) === "object") {
    for (let k in obj1) {
      if (k in obj2) obj1[k] = deepMerge(obj1[k], obj2[k]);
    }
  }
  return merge(obj1, obj2, removeNull);
}

/**
 * safely add a value to an object even if the property dosen't exists
 * if builds all of the properties from the path, then assigns the value to the last segment
 *
 * ex: let obj={};
 *     obj.a.b.c=1 //error
 *     buildPath(obj,"a.b.c")
 *     obj.a.b.c=1 //ok
 *
 * @method addValue
 * @param  object    [description]
 * @param  path      [description]
 * @param  value      [description]
 * @param  strategy      [description]
 * @return [description]
 *
 * https://lowrey.me/create-an-object-by-path-in-javascript-2/
 * https://stackoverflow.com/a/7070222/12577650
 */
export function addValue(
  object,
  path: string,
  value?: any,
  strategy: "merge" | "replace" = "replace"
) {
  let segments = path.split("."),
    length = segments.length,
    current = object;

  segments.forEach((segment, index) => {
    //assign the value to the last segment
    if (index === length - 1) {
      //if there is an existing value & strategy = merge -> merge values
      //todo: merge(current,value)
      if (strategy === "merge" && current[segment]) {
        let type = objectType(value);
        if (type === "array")
          value.forEach(el => {
            if (!current[segment].includes(el)) current[segment].push(el);
          });
        else if (type === "object")
          current[segment] = merge(value, current[segment]);
        else current[segment] = value;
      } else current[segment] = value;
    } else if (current[segment] === undefined) current[segment] = {};
    current = current[segment];
  });
  return object;
}
