import { Observable, combineLatest } from "rxjs";
import { ActivatedRoute, ParamMap } from "@angular/router";

//export type Param = Observable<ParamMap>;
/**
 * Observe changes of the activated route for both params and query strings.
 * @method urlParams
 * @param  route     the current activated route
 * @return Observable<[Param, Param]>
 */
export function urlParams(
  route: ActivatedRoute
): Observable<[ParamMap, ParamMap]> {
  //use combineLatest (not forkJoin), because route.paramMap and route.queryParamMap
  //may be changed at any time again and again, every time any of them changes it will emit the current (latest)
  //value from each one.
  return combineLatest(route.paramMap, route.queryParamMap);
}
