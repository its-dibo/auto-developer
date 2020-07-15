import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { QuillViewComponent } from "ngx-quill"; //todo: enable sanitizing https://www.npmjs.com/package/ngx-quill#security-hint
import { obs } from "pkg/ngx-tools";
import { Article, Pref } from "./article";
import { MetaService } from "pkg/ngx-tools/meta.service";
/*
- usage:
<content-view [data]="{title,content,keywords[],auther{},...}" [related]="[{id,title,..}]" >
*/

export type Payload = Article | Article[];

export type Data = {
  payload: Payload;
  tags?: { [key: string]: any }; //todo: import MetaTags from meta.service
};

export interface DataObj {
  type?: "list" | "item";
  payload: Payload;
}

@Component({
  selector: "ngx-content-view",
  templateUrl: "./view.html",
  styleUrls: ["./view.scss"]
})
export class NgxContentViewComponent implements OnInit {
  @Input() data: Data | Observable<Data>;
  @Input() pref: Pref; //component prefrences
  dataObj: DataObj;

  constructor(private meta: MetaService) {}

  ngOnInit() {
    this.pref = this.pref || {};

    //todo: pref.back=/$item.categories[0]
    this.pref.back = this.pref.back || "/";

    obs(this.data, result => {
      //if (typeof data == "string") data = JSON.parse(data);
      let data = result.payload,
        tags = result.tags;

      if (data.baseUrl && data.link && data.link.startsWith("/"))
        data.link = data.baseUrl + data.link;

      if (data instanceof Array) {
        this.dataObj = { type: "list", payload: data };
      } else {
        this.dataObj = { type: "item", payload: !data.error ? data : null };
      }

      tags = {
        image: data.cover,
        description: data.description || data.summary,
        author: data.author ? data.author.name : null,
        keywoadrs:
          data.keywords instanceof Array
            ? data.keywords.join(",")
            : data.keywords,
        date: data.createdAt, //todo: || now
        "last-modified": data.updatedAt, //todo: convert time format, todo: use createdAt, updatedAt
        ...(data instanceof Array ? null : data),
        ...tags
      };

      delete tags.id;
      delete tags.slug;
      delete tags.cover;
      delete tags.content;
      delete tags.summary;
      delete tags.sources; //todo: display resources
      delete tags.path; //todo: display path, ex: news/politics
      delete tags.createdAt;
      delete tags.updatedAt;

      this.meta.setTags(tags);
    });
  }
}
