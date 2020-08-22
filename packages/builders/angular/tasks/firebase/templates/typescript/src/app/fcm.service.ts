import { Injectable } from "@angular/core";
import { AngularFireMessaging } from "@angular/fire/messaging";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class FCMService {
  currentMessage = new BehaviorSubject(null);
  constructor(private angularFireMessaging: AngularFireMessaging) {
    this.angularFireMessaging.messaging.subscribe(messaging => {
      messaging.onMessage = messaging.onMessage.bind(messaging);
      messaging.onTokenRefresh = messaging.onTokenRefresh.bind(messaging);
    });
    /* or:
    import * as firebase from "firebase/app";
    import "firebase/messaging";

    const messaging = this.firebase.messaging();
    navigator.serviceWorker.getRegistration().then(registration => {
      console.log({ registration });
      if (
        !!registration &&
        registration.active &&
        registration.active.state &&
        registration.active.state === "activated"
      ) {
        messaging.useServiceWorker(registration);
        this.getNotifsPermition();
        //this.messagingSvc.receiveMessage();
      } else {
        console.error(
          "No active service worker found, unable to get firebase messaging"
        );
      }
    });
    */
  }

  //todo: a step-by-step tutorial how to allow notifications & allow if automatically blocked
  requestPermission() {
    this.angularFireMessaging.requestToken.subscribe(
      token => {
        console.log("notification permission granted", token);
      },
      error => {
        //todo: tutorial how to remove site from block list
        console.error("FCM Permission denied!\r", error);
      }
    );
  }

  receiveMessage() {
    //or use SwPush from @angular/service-worker
    this.angularFireMessaging.messages.subscribe(payload => {
      console.log("new message received. ", payload);
      this.currentMessage.next(payload);
    });
  }
}
