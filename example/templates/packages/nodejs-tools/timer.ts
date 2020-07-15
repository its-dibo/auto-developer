/*
measure the execution time
example:
 setTimer('connection')
 connect().then(()=>console.log("connected", getTimer('connection')))

 logs: connected +5s (i.e: connection took 5 seconds)

 */

var timer = {};

export function setTimer(name?: string, time?: number) {
  timer[name || "default"] = time || new Date().getTime();
}

export function getTimer(name?: string, timeline = false) {
  let _now = now();
  let diff = (_now - timer[name] || _now) / 1000;
  //if(!timeline) calculate the diff cumulativly,
  //i.e: the difference between now and the last timer, not from the start
  //ex: +3s
  if (!timeline) setTimer(name, _now);

  return !timeline ? "+" + diff + "s" : diff;
}

export function endTimer(name?: string, timeline?: boolean) {
  let diff = getTimer(name, timeline);
  removeTimer(name);
  return diff;
}

export function removeTimer(name?: string) {
  delete timer[name || "default"];
}

export function resetTimer(name?: string) {
  setTimer(name, 0);
}

/**
 * get the current timestamp in milli seconds
 * @method now
 * @return timestamp in milli seconds
 */
export function now(): number {
  return Math.round(new Date().getTime());
}
