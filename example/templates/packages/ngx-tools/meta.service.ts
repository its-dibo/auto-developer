// todo: types
//todo tags.author{name, email, url}
import { Injectable } from "@angular/core";
import {
  Meta as MetaTagsService,
  Title as TitleService
} from "@angular/platform-browser"; // for SSR: https://github.com/angular/angular/issues/15742#issuecomment-292892856
import { NgxToolsLoadService } from "./load-scripts.service";

export namespace types {
  export interface App {
    id?: string;
    name?: string;
    url?: string;
  }

  export interface Image {
    src?: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
  }
  export interface Meta /* todo: extends types.Object*/ {
    image?: string | types.Image;
    title?: string;
    name?: string;
    description?: string; //or desc
    baseUrl?: string;
    url?: string; //or link
    fb_app?: string;
    apps?: {
      iphone: App;
      googleplay: App;
      ipad: App;
    };
    twitter?: {
      //https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/markup
      card?: string;
      site?: string;
      "site:id"?: string;
      creator?: string;
      "creator:id"?: string;
      description?: string; //max: 200 chars
      title?: string;
      image?: string;
      "image:alt"?: string;
      player?: string;
      "player:width"?: string;
      "player:height"?: string;
      "player:stream"?: string;
      "app:name:iphone"?: string;
      "app:id:iphone"?: string;
      "app:url:iphone"?: string;
      "app:name:googleplay"?: string;
      "app:id:googleplay"?: string;
      "app:url:googleplay"?: string;
      "app:name:ipad"?: string;
      "app:id:ipad"?: string;
      "app:url:ipad"?: string;
    };

    [key: string]: any;
  }
}

@Injectable()
export class MetaService {
  constructor(
    private metaService: MetaTagsService,
    private titleService: TitleService,
    private loadService: NgxToolsLoadService
  ) {}

  setTags(tags: types.Meta = {}) {
    let defaultTags = {
      viewport: "width=device-width, initial-scale=1",
      type: "website",
      charset: "UTF-8",
      "content-type": "text/html"
    };

    tags = Object.assign(defaultTags, tags);

    tags.title = tags.title || tags.name;
    if (tags.name && tags.title != tags.name) {
      tags.title += " | " + tags.name;
    }

    if (!tags.baseUrl) tags.baseUrl = "/";
    else if (tags.baseUrl.substr(-1) !== "/") tags.baseUrl += "/";

    tags.url = tags.url || tags.link;
    if (tags.url) {
      if (tags.url.startsWith("/")) tags.url = tags.baseUrl + tags.url.slice(1);
      tags["og:url"] = tags.url;
    }

    if (tags.image) {
      if (typeof tags.image == "string")
        tags.image = { src: <string>tags.image };
      if (tags.image.src && tags.image.src.startsWith("/"))
        (<types.Image>tags.image).src = tags.baseUrl + tags.image.src.slice(1);

      tags["og:image"] = (<types.Image>tags.image).src;
      tags["og:image:width"] = (<types.Image>tags.image).width;
      tags["og:image:height"] = (<types.Image>tags.image).height;
    }

    tags["og:site_name"] = tags.name;
    tags["og:title"] = tags.title;
    tags["og:description"] = tags.description;

    tags["fb:app_id"] = tags["fb:app_id"] || tags.fb_app;

    let defaultTwitterTags = {
      card: "summary_large_image",
      title: tags.title,
      image: tags.image ? (<types.Image>tags.image).src : null,
      description: tags.description,
      creator: tags.author
    };

    if (tags.apps) {
      for (let k in tags.apps) {
        for (let kk in tags.app[k])
          defaultTwitterTags[`${kk}:${k}`] = tags.app[k][kk];
      }
    }

    tags.twitter = Object.assign(defaultTwitterTags, tags.twitter || {});

    if (tags.twitter) {
      for (let key in tags.twitter) {
        let value = tags.twitter[key];
        if (!value) continue;
        if (key.slice(0, 8) === "twitter:") key = key.slice(8);
        if (key === "site" || key === "site:id") {
          if (!value.startsWith("@")) value = "@" + value;
        } else if (key === "description") value = value.slice(0, 200);
        tags[`twitter:${key}`] = value;
      }
    }

    //canonical is <link> not <meta>, so we don't use metaTags service here.
    if (tags.url) this.loadService.load(tags.url, "link", { rel: "canonical" });
    if (tags.image)
      this.loadService.load((<types.Image>tags.image).src, "link", {
        rel: "image_src"
      });
    this.titleService.setTitle(tags.title);

    delete tags.desc;
    delete tags.link;
    delete tags.url;
    delete tags.image;
    delete tags.img;
    delete tags.fb_app;
    delete tags.baseUrl;
    delete tags.twitter;

    // set meta tags, remove null values
    let _tags = [];
    for (let key in tags) {
      if (tags[key]) {
        _tags.push(this.prepare(key, tags[key]));
      }
    }

    //console.log({ metaTags: _tags });
    this.metaService.addTags(_tags, false);

    // todo: icon, refresh:url | [url,time],
  }

  updateTags(tags: types.Meta) {
    // todo: when updating title 'for example', also update og:title, twitter:title, ...
    // there is no method called: this.metaService.updateTags()
    for (let key in tags) {
      if (key === "url" || key === "link")
        this.loadService.load(tags[key], "link", { rel: "canonical" });
      else this.metaService.updateTag(this.prepare(key, tags[key]));
    }
  }

  /**
   * converts {title: '==title=='} to {name: title, content:'==title=='}
   * @method prepare
   * @param  key     [description]
   * @param  value   [description]
   * @return [description]
   */
  prepare(key: string, value: any) {
    let prop: string;
    if (key.substr(0, 3) == "og:") {
      prop = "property";
    } else if (["charset"].includes(key)) {
      prop = key;
    } else if (key == "http-equiv" || key == "httpEquiv") {
      prop = "httpEquiv";
      [key, value] = value; // ex: {httpEquiv:['content','text/html']}
    } else if (
      [
        "date",
        "last-modified",
        "expires",
        "location",
        "refresh",
        "content-type",
        "content-language",
        "cache-control"
      ].includes(key)
    ) {
      //http://help.dottoro.com/lhquobhe.php
      //ex: <meta http-equiv=”last-modified” content=”YYYY-MM-DD”>
      prop = "httpEquiv";

      if (key === "location")
        value = value.slice(0, 4) !== "URL=" ? "URL=" + value : value;
      else if (key === "refresh")
        value =
          value instanceof Array ? `${value[0]}; URL='${value[1]}'` : value;
    } else {
      prop = "name";
    }

    // todo: itemprop i.e: <meta name> VS <meta itemprop>
    return { [prop]: key, content: value };
  }

  filter(tags) {
    let allowed = ["title", "description", "content", "refresh"]; // todo: list all allowed meta tags

    Object.keys(tags)
      .filter(key => allowed.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: tags[key] }), {});

    /* using ES2019 fromEntries()
    return Object.fromEntries(
      Object.entries(tags).filter(([key, val]) => allowed.includes(key))
    );*/
  }
}
