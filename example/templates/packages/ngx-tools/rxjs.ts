import { Observable } from "rxjs";

/**
 * if the value is an observable, subscribe to it and run the callback,
 * if not, just run the call back.
 * use this function if the value tybe may be an Observable or not,
 * so you don't need to repeat the code in both cases.
 * @example:
 * obs(data,(data)=>{ this._data=data; doSomething(); })
 * @method obs
 * @param  value
 * @param  cb    the callback function, it receives the final value.
 * @return [description]
 */
export function obs(value: any, cb: (value: any) => void) {
  if (value instanceof Observable) {
    value.subscribe(v => cb(v));
  } else cb(value);
}
//
