/**
 * to pause a js function make it async and use await sleep(duration);
 * @examples async function test(){console.log(1); await sleep(2); console.log(1);}
 * @method sleep
 * @param  seconds [description]
 * @return [description]
 *
 * todo:
 *  - move to promises
 */
export function sleep(seconds?: number): Promise<void> {
  // ex: this.run(async fn(){await this.sleep(1); alert(1);})
  return new Promise(resolve => setTimeout(resolve, (seconds || 2) * 1000));
}
