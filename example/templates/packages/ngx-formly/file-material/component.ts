//formly doesn't support 'file' type, so we create a custom one.
//todo: pass attributes, such as style="display:none;" to replace it with a button
//add it to module:   FormlyModule.forRoot({types: [{ name: 'file', component: FormlyFieldFile, wrappers:['form-field'] }, ]}),
//todo: pass label:  {type:"file",label:"we don't want this value, pass it to out child component as an attribute", templateOptions:{attributes:{label:"cover image"}}}
//todo: emit events: progress, response, change (fileAdded)
//todo: move custom types (such as quill) out of formly

import { Component, Directive, ViewChild, Input, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

@Component({
  selector: "formly-field-file",
  templateUrl: "./component.html"
})
export class FormlyFieldFile extends FieldType {
  @ViewChild("fileInput") fileInput;
  files: Set<File> = new Set();

  //available: this.formControl, this.to, this.fileInput.nativeElement.getAttribute("data-test")

  addFiles() {
    //clicks on <input #file>
    this.fileInput.nativeElement.click();
  }

  onFilesAdded() {
    let files: File[] = this.fileInput.nativeElement.files;
    if (this.to.multiple) files.forEach(file => this.files.add(file));
    else this.files = new Set([files[0]]);
  }

  remove(file) {
    this.files.delete(file);
  }

  clear() {
    this.files.clear();
  }
}

//ControlValueAccessor for 'file' input
//https://formly.dev/examples/other/input-file
//https://github.com/angular/angular/issues/7341
@Directive({
  selector: "input[type=file]",
  host: {
    "(change)": "onChange($event.target.files)",
    "(blur)": "onTouched()"
  },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: FileValueAccessor, multi: true }
  ]
})
export class FileValueAccessor implements ControlValueAccessor {
  value: any;
  onChange = _ => {};
  onTouched = () => {};

  writeValue(value) {}
  registerOnChange(fn: any) {
    this.onChange = fn;
  }
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }
}
