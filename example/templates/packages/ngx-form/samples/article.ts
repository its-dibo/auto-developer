import { FormlyFieldConfig } from "@ngx-formly/core";
const fields: FormlyFieldConfig[] = [
  {
    key: "title", //todo:add validators: <100 chars, no special chars,...
    type: "input",
    templateOptions: {
      label: "Title",
      description: "maximum: 200 charachters",
      required: true,
      maxLength: 200
    },
    validation: {
      messages: {
        maxLength: "title is too long"
      }
    }
  },
  {
    key: "subtitle",
    type: "input",
    templateOptions: {
      label: "Subtitle",
      maxLength: 200
    }
  },
  {
    key: "slug",
    type: "input",
    templateOptions: {
      label: "slug",
      maxLength: 50,
      description: "maximum: 50 charachters"
    }
  },
  {
    key: "content", //todo: auto resize,
    type: "textarea",
    templateOptions: {
      label: "Content",
      required: true,
      rows: 10
    }
  },
  {
    key: "keywords",
    type: "input",
    templateOptions: {
      label: "keywords",
      description: "article sources"
    }
  },
  {
    key: "sources",
    type: "textarea",
    templateOptions: {
      label: "Sources",
      rows: 10
    }
  },
  {
    key: "cover",
    type: "file", //or: component:FormlyFieldFile, wasn't tested
    templateOptions: {
      label: "Cover image", //todo: move this to attributes.label
      multiple: false,
      accept: "image/*"

      //  change: "onFilesAdded()", //todo: error??
      //to add a header: attributes: {data-header:'say something'}
    }
  }
];
export default fields;
