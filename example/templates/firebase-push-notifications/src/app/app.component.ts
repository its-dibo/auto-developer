import { Component } from "@angular/core";
import { FCMService } from "./fcm.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "angular-cms";

  ngOnInit() {
    this.FCMService.receiveMessage();
  }

  getNotifsPermition() {
    this.FCMService.getNotifsPermition();
  }
}
