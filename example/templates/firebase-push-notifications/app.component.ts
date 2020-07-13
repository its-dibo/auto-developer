import { Component, OnInit } from "@angular/core";
import * as firebase from "firebase/app";
import "firebase/messaging";
import { SwPush } from "@angular/service-worker";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  title = "example";

  constructor(swpush: SwPush) {
    swpush.messages.subscribe(msg => console.log("push message", msg));
    swpush.notificationClicks.subscribe(click =>
      console.log("notification click", click)
    );
  }

  ngOnInit() {
    //todo: or initialize in server
    if (!firebase.apps.length) {
      let firebaseConfig = require("..../firebase/config.json");
      firebase.initializeApp(firebaseConfig);
      navigator.serviceWorker
        .getRegisteration()
        .then(sw => firebase.messageing().useServiceWorker(sw));
    }
  }

  getNotifsPermition() {
    firebase
      .messaging()
      .requestPermission()
      .then(() =>
        //todo: this.msg
        //todo: save token to localhost
        this.msg.getToken().then(token => console.log({ token }))
      )
      .catch(error =>
        console.warn(`permission to notifications denied`, { error })
      );
  }
}
