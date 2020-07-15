import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormlyModule } from "@ngx-formly/core";
import { NgxFormComponent } from "./form";
import { MatButtonModule } from "@angular/material/button";
import { NgxContentCoreModule } from "../ngx-content/core";
import { NgxLoadingModule } from "ngx-loading";
/*
 - we added NgxFormComponent to @NgModule.exports[]
   to be used in other modules (parent component),
   whether in thml template or via @ViewChild()
 */
@NgModule({
  declarations: [NgxFormComponent],
  imports: [
    NgxContentCoreModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    MatButtonModule,
    NgxLoadingModule.forRoot({
      primaryColour: "red",
      secondaryColour: "blue",
      tertiaryColour: "green"
    })
  ],
  exports: [NgxFormComponent]
})
export class NgxFormModule {}
