import { NgModule } from "@angular/core";
import {
  SlugPipe,
  ContentPipe,
  SummaryPipe,
  Nl2brPipe,
  KeepHtmlPipe,
  LengthPipe
} from "./pipes";

//we export Pipes, so other modules that imports this module can use them.
@NgModule({
  declarations: [
    SlugPipe,
    ContentPipe,
    SummaryPipe,
    Nl2brPipe,
    KeepHtmlPipe,
    LengthPipe
  ],
  imports: [],
  exports: [
    SlugPipe,
    ContentPipe,
    SummaryPipe,
    Nl2brPipe,
    KeepHtmlPipe,
    LengthPipe
  ]
})
export class NgxContentCoreModule {}
