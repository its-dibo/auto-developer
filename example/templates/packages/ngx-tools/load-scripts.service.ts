import { Injectable, Inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";

//todo: do we need to make this class as a service, or just a function?
//don't forget to add this service to ngModule.provide[]
@Injectable()
export class NgxToolsLoadService {
  constructor(@Inject(DOCUMENT) private document) {}

  load(
    src,
    type = "script",
    attributes: { [key: string]: any } = {},
    cb?: (type: string) => void,
    parent? //todo: HtmlElement
  ) {
    //tmp: for index.html
    //if (!cb) cb = ev => console.log("[load]", ev, src);

    if (type === "css") {
      type = "link";
      attributes.rel = "stylesheet";
      attributes.type = "text/css";
    }

    if (type === "link") {
      attributes.href = src;
      attributes.crossorigin = true; //https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content#Cross-origin_fetches
    } else if (type === "script" || type === "module") {
      attributes.src = src;
      //todo: text/javascript VS application/javascript
      //https://stackoverflow.com/questions/21098865/text-javascript-vs-application-javascript
      attributes.type = type === "script" ? "text/javascript" : type;
    }

    if (!("async" in attributes)) attributes.async = true;

    let el = this.document.createElement(type === "link" ? "link" : "script");
    for (let key in attributes) {
      el.setAttribute(key, attributes[key]);
    }

    //or return a promise -> new Promise(resolve=>{el.onLoad=resolve})
    if (cb && typeof cb === "function") {
      el.addEventListener("load", ev => cb("loaded", ev));
      el.addEventListener("readystatechange", ev => cb("ready", ev));
      el.addEventListener("error", ev => cb("error", ev));
    }

    (parent || this.document.getElementsByTagName("head")[0]).appendChild(el);
  }

  adsense(
    id: string,
    cb?: (type: string) => void,
    attributes: { [key: string]: any } = {},
    src?: string
  ) {
    attributes["data-ad-client"] = id;
    return this.load(
      src || "//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
      "script",
      attributes,
      cb
    );
  }
}
