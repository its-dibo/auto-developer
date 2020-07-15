import { https } from "firebase-functions";

/**
 * convert expressjs app (or nodejs http requests) into firebase cloud function
 * @method express
 * @param  app     [description]
 * @return [description]
 *
 * notes:
 *  - https://us-central1-<projectId>.cloudfunctions.net/<functionName>
 *    or http://localhost:4201/<projectId>/us-central1/<functionName>
 *    get projectId from the file: `/.firebaserc`
 */
export function express(app) {
  return https.onRequest(app);
}
