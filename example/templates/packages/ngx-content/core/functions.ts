//todo move functions, pipes to ngx-content/core; because this package (view) requires many peepDependencies
import {
  DomSanitizer,
  ɵDomSanitizerImpl,
  SafeHtml
} from "@angular/platform-browser";

//todo: import from @dibo/general
function objectType(obj: any): string {
  return Object.prototype.toString
    .call(obj)
    .replace("[object ", "")
    .replace("]", "")
    .toLowerCase();
}

export type ContentValue = any; //todo: article{} | string
export interface Obj {
  [k: string]: any;
}

export function getValue(value, keys?: string | string[]) {
  if (objectType(value) == "object") {
    if (!(keys instanceof Array)) keys = [keys];
    for (let i = 0; i < keys.length; i++)
      if (value[keys[i]] && value[keys[i]] !== "") return value[keys[i]];
  }
  if (typeof value != "string") return "";
  return value;
}

/**
 * [slug description]
 * @method slug
 * @param  value           [description]
 * @param  lngth=200       [description]
 * @param  allowedChars="" regex style ex: a-z0-9
 * @return [description]
 */
export function slug(
  value: ContentValue,
  lngth = 200,
  allowedChars = "",
  encode = true
) {
  let lang = {
    ar: "أابتثجحخدذرزسشصضطظعغفقكلمنهويىآئءلألإإآة"
  };

  allowedChars = allowedChars
    .split("|")
    .map(el => (el.startsWith(":") ? lang[el.substr(1)] : ""))
    .join("");
  let slug = getValue(value, ["slug", "title"])
    .trim() //remove trailing spaces
    .replace(new RegExp(`[^a-z0-9-._~${allowedChars}]`, "gi"), "-") //remove unallowed charachters
    .replace(/\s+/g, "-") //replace inner spaces with '-'
    .replace("/", "") //replace '/' with '-', to prevent changing the current route ex: url/slug1-slug2 instead of /slug1/slug2 (in case of encode=false)
    .replace(/-{2,}/g, "-") //remove sequental slaches
    .replace(/^-+|-+$/g, ""); //remove trailing slashes, equivilant to php .trim('-'), starts or ends with one or more slashes

  return length(encode ? encodeURIComponent(slug) : slug, lngth);
  //todo: remove unwanted charachters & very short words}
}
export function content(value: ContentValue) {
  return getValue(value, ["content"]).replace(/\r\n|\n\r|\r|\n/g, "<br />"); //nl2br
  //todo: KeepHTML, hypernate links,...
}
export function summary(value: ContentValue, lngth = 500, options: Obj = {}) {
  if (options.br !== false) options.br = true; //keep <br>
  return length(html2text(getValue(value, ["content"]), options), lngth);
}

export function html2text(value: string, options: Obj = {}) {
  /*
options:
 -br: true= use <br />, false= use \n
 -links: true= text (link.href), false= text
 */
  value = options.br
    ? value.replace(/<p(>| .*>)/gi, "<br />") // we need only <p> or <p .*>, but not <pxxx>
    : value.replace(/<br.*>/gi, "\n").replace(/<p(>| .*>)/gi, "\n");

  value = value.replace(
    /<a.*href="(.*?)".*>(.*?)<\/a>/gi,
    options.links ? " $2 ($1) " : " $2 "
  );

  return value
    .replace(/<(style|script|meta)[^>]*>.*<\/\1>/gm, "") //remove inline <style>, <script>, <meta> blocks
    .replace(/<[^>]+>/g, "") //strip html, or: /<(?:.|\s)*?>/
    .replace(/([\r\n]+ +)+/gm, ""); //remove leading spaces and repeated CR/LF
}

export function length(value: string, lngth = 0) {
  return lngth && value ? value.slice(0, lngth) : value;
}

export function nl2br(value: string) {
  return getValue(value).replace(/\r\n|\n\r|\r|\n/g, "<br />");
}

/*
todo:
- if (!sanitizer) sanitizer = new DomSanitizer(); //todo: error TS2511: Cannot create an instance of an abstract class.
  also ɵDomSanitizerImpl();needs 1 argument: constructor(_doc)

-SafeHtml is type, so we cannot use it at runtime
  return content instanceof SafeHtml
    ? content
    : sanitizer.bypassSecurityTrustHtml(content);
  */
/**
 * prevent Angular from sanitizing DOM, https://angular.io/guide/security#xss
 * @method keepHtml
 * @param  value     the value to be bypassed
 * @param  sanitizer DomSanitizer
 * @return SafeHTML, the bypassed html value.
 */
export function keepHtml(value: ContentValue, sanitizer?): string {
  let content = getValue(value, "content");
  return sanitizer.bypassSecurityTrustHtml(content);
}

/*
//or extends ProgressEvent; https://stackoverflow.com/a/35790786
interface FileReaderEventTarget extends EventTarget {
  result: string;
}
export interface FileReaderEvent extends Event {
  target: FileReaderEventTarget;
  getMessage(): string;
}
//usage: $("#img").attr("src", imgPreview(form.files[0]));
//http://jsfiddle.net/LvsYc/638/
//todo: return Observable
export function imgPreview(file: FileReaderEvent) {
  //todo: file:blob not FileReaderEvent
  if (file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e) {
      return e.target.result;
    };
  }
}
*/
