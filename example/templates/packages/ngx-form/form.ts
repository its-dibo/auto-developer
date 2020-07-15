import {
  Component,
  OnInit,
  ViewChild,
  ViewChildren,
  QueryList,
  Input,
  Output,
  EventEmitter,
  SimpleChanges
} from "@angular/core";
import { Observable } from "rxjs";
import { keepHtml } from "../ngx-content/core/functions";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { FormGroup, FormArray } from "@angular/forms";
import {
  FormlyFieldConfig,
  FormlyFormOptions,
  FieldArrayType
} from "@ngx-formly/core";
import { obs } from "pkg/ngx-tools";

//you need to add css classes: alert, alert-ok, alert-error for `reponse` div

export interface FormObj {
  form?: FormGroup | FormArray;
  fields?: FormlyFieldConfig[];
  steps?: Step[];
  model?: { [key: string]: any }; //data from API calls
  options?: FormlyFormOptions;
  title?: string;
}

export interface Step {
  title?: string;
  fields?: FormlyFieldConfig[];
}

export interface Response {
  status: "ok" | "error" | "loading";
  message?: string;
  class?: { [className: string]: boolean };
}

export interface Progress {
  loaded: number;
  total?: number;
}

@Component({
  selector: "ngx-form",
  templateUrl: "./form.html"
})
export class NgxFormComponent implements OnInit {
  @Input() formObj: FormObj | Observable<FormObj>;
  _formObj: FormObj;
  @Input() response: Response;
  @Input() progress: Progress; //todo: show progress bar
  @Input() step: number;
  @Output() submit = new EventEmitter<FormObj>();

  //give the parent component access to #formElement, whitch is a child of this component
  @ViewChild("formElement") formElement; //todo: formElement:ElementRef<HTMLElement>

  /*
  in parent component, subscribe to `formChange` event to update `this.formObj`
  even if the form has not been submitted.
  the `submit` event provide the recent updated version of `formObj`, so you can
  use it to update this.formObj value each time the form has been submitted.
   */
  @Output() formChange = new EventEmitter<FormObj>();

  constructor(private sanitizer: DomSanitizer) {}

  //todo: output: onSubmit
  //todo: onSubmit -> update response
  //todo: to auto fill the form use $formObj.model
  ngOnInit() {
    //todo: use <ngx-form [formObj]="formObj | async">
    //https://stackoverflow.com/q/61681239/12577650
    obs(this.formObj, v => {
      this._formObj = v;
      this.adjust();
      console.log({ _formObj: this._formObj });
    });
  }

  adjust() {
    if (this._formObj) {
      this._formObj.form = this._formObj.form || new FormGroup({});
      if (this._formObj.steps) {
        this.step = this.step || 0;
        this.go();
      }
    }
  }

  go(n = 0) {
    this.step += n;
    let step = this._formObj.steps[this.step];

    if (step) {
      //https://stackoverflow.com/a/46070221/12577650
      this._formObj = Object.assign(this._formObj, {
        fields: step.fields,
        title: step.title
        //  model: this.formObj.form.value
      });

      this.save(); //save the current value,so the feilds values preserved when the user come back to this step.
    }
  }

  save(replace = false) {
    //update `model` with current state.
    /*if (this.formObj.form.value) {
      let v = this.formObj.form.value;
      if(replace)this.formObj.model=v
      v.forEach(k => (this.formObj.model[k] = v[k]));
    }*/
  }
  onSubmit(formObj: FormObj) {
    //emit the EventEmitter `submit`, and send `formObj`
    this.submit.emit(formObj);
  }

  onFormChange(formObj: FormObj) {
    //todo: subscribe to `formly` (or form.value) change event.
    this.formChange.emit(formObj);
  }

  ngOnChanges(changes: SimpleChanges) {
    //console.log({ changes });
    if ("response" in changes && changes.response.currentValue) {
      let resp = changes.response.currentValue;

      this.response.class = {
        [`alert-${resp.status === "loading" ? "warning" : resp.status}`]: true
      };

      if (!this.response.message)
        this.response.message =
          status === "ok"
            ? "Form submitted successfully"
            : resp.status === "error"
            ? "Error"
            : "Loading....";
    }
  }
}
