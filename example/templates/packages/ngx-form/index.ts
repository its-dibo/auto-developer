export * from "./form";
export * from "./module";
export * from "./samples";

/*
the following properties are available from node_modules/@ngx-formly/core/lib/templates/fileType.d.ts
-> can be used inside the template: ex: {{field | json}}
->go to {FieldType} to see all properties from parent classes.

 - field: F;  -> {key, type, id, templateOptions, hooks, ...}
 - defaultOptions?: F;
 - model: any;
 - form: FormGroup;
 - options: F['options'];
 - readonly key: string;
 - readonly formControl: import("@angular/forms").AbstractControl;
 - readonly to ... ; //same as field.templateOptions{}
 - readonly showError: boolean;
 - readonly id: string; //same as field.id
 - readonly formState: any;

 in addition to properties from node_modules/@ngx-formly/lib/components/formly.field.config.d.ts

you need to add custom-component to some types such as `file`, `content`


to add static text:
{ noFormControl: true, template: "<p>Some text here</p>" } or
{ noFormControl: true, templateUrl: 'path/to/template.html' }


 */
