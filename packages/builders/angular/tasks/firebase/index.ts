import {
  Tree,
  SchematicContext,
  chain,
  templates,
  error as _error,
  Obj
} from "@engineers/auto-developer/tools/schematics";
import { deepMerge } from "@engineers/auto-developer/tools/objects";
import { package, json } from "@engineers/auto-developer/tools/json";
import { addImports } from "@engineers/auto-developer/tools/typescript";

function error(msg, mark) {
  _error(msg, "angular:firebase" + mark ? `/${mark}` : "");
}
export interface Options extends Obj {}
export default function(
  tree: Tree,
  options: Options,
  config,
  context: SchematicContext
) {
  return chain([
    tree => {
      if (config.dev)
        console.log(">> [angular:firebase] creating files from templates");
      let defaultOptions = {
        path: config.path,
        name: config.name, //firebase project name as created via firebase dashboard
        dist: "dist",
        //the folder that contain 'firebase' logic, to install firebase packages in the project's root use source:.
        source: "firebase",
        language: "typescript",
        //todo: add engine:{node:*}
        node: 8,
        //firebase cloud messages (for push_notifications)
        fcm: false,
        rules: {
          database: { ".read": false, ".write": false },
          firestore: {
            indexes: [],
            fieldOverrides: [],
            version: 2,
            rules: `
         match /databases/{database}/documents {
          match /{document=**} {
            allow read, write;
          }
        }`
          },
          storage: {
            version: 2,
            rules: `
       match /b/{bucket}/o {
         match /{allPaths=**} {
           allow read, write: if request.auth!=null;
        }
      }`
          }
        }
      };
      options = deepMerge(options, defaultOptions, true);
      options.public = options.public || options.dist;
      options.main = options.main || `${options.dist}/index.js`;

      //todo: move to options.path/options.source (ex: project/firebase, project/.)
      return templates(
        [`${__dirname}/templates/${options.language}`, context],
        options.path,
        { options }
      );
    },
    tree => {
      if (config.dev) console.log(">> [angular:firebase] adding dependencies");

      //todo: select versions based on firebase version
      package.add(
        tree,
        {
          firebase: "^7.14.6",
          "firebase-functions": "^3.8.0",
          "firebase-admin": "^8.13.0", //todo: only if firebase run in the server-side.
          "@angular/fire": "^6.0.0"
        },
        "",
        `${options.path}/package.json`
      );

      package.add(
        tree,
        {
          "firebase-admin": "^8.6.0",
          "firebase-functions": "^3.3.0"
        },
        "",
        `${options.path}/firebase/package.json`
      );

      return package.add(
        tree,
        {
          "firebase-functions-test": "^0.1.6"
        },
        "dev",
        `${options.path}/firebase/package.json`
      );
    },
    //todo: add firebase:* scripts, ex: firebase:deploy,...
    //todo: install @engineers/firebase
    tree => {
      if (config.dev)
        console.log(`>> [angular:firebase] adding scripts to package.json`);
      return json.write(
        tree,
        `${options.path}/package.json`,
        {
          scripts: {
            "firebase:build": "tsc -p firebase/tsconfig.json",
            "firebase:token": "firebase login:ci"
          }
        },
        "deepMerge"
      );
    },
    tree => {
      //firebase cloud messaging (push_notifications)
      if (options.fcm) {
        if (config.dev)
          console.log(
            `>> [angular:firebase] enabling push notifications via FCM`
          );

        //todo: if(!ngsw, i.e:FCM requires service worker, add PWA to the project) warning

        //https:medium.com/kabbage-engineering/angular-pwa-app-notification-using-firebase-cloud-messaging-d1b7bd171b98
        //final code: https://github.com/zhangxin511/PushDemo
        addImports(tree, `${options.path}/src/app/app.component.ts`, {
          "* as firebase": "firebase/app", //todo: or firebase-admin (for server-side)
          "": "firebase/messaging", //admin.messaging()
          SwPush: "@angular/service-worker"
        });

        /*
        //todo: add this code to app.component.ts
        //todo: import OnInit

         constructor(swpush:SwPush){
           swpush.messages.subscribe(msg => console.log('push message', msg));
           swpush.notificationClicks.subscribe(click => console.log('notification click', click));
       }
       ngOnInit(){
         //todo: or initialize in server
         //consumer has to add firebaseConfig to imports
         //ex: import firebaseConfig from 'path/to/firebaseConfig.js'
         if (!firebase.apps.length) {
           firebase.initializeApp(firebaseConfig);
           navigator.serviceWorker
             .getRegistration()
             .then(sw => firebase.messageing().useServiceWorker(sw));
         }
       }

       getNotifsPermition() {
         let msg = firebase.messaging();
         msg
           .requestPermission()
           .then(() =>
             //todo: this.msg?
             //todo: save token to localhost
             //sendTokenToServer(currentToken);
             //updateUIForPushEnabled(currentToken);
             msg.getToken().then(token => console.log({ token }))
           )
           .catch(error =>
             console.warn(`permission to notifications denied`, { error })
           );
       }

        //app.component.html
        <button (click)="getNotifsPermition()">allow notifications</button>
        */

        //todo: modify dist/ngsw-worker to handle background clicks event
      }
      return tree;
    }
  ]);
}
