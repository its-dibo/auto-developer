import { Component } from "@angular/core";
import { FieldType } from "@ngx-formly/material";

//todo: move quill as a formly dependencies, and replace Fields.content.type from textarea to quill
@Component({
  selector: "formly-field-quill",
  template: `
    <quill-editor
      [formControl]="formControl"
      [formlyAttributes]="field"
      [modules]="to.modules"
    ></quill-editor>
  `
})
export class FormlyFieldQuill extends FieldType {
  //@Input() modules = {};
}
