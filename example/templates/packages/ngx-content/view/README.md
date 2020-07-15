# ngx-content-view

pass an article or a post to this component and it will render it to the view.

usage:

```
<content-view [data]="data$" [pref]="pref"></content-view>
```

## data\$:

data can be an `Article` object or an array of articles, or an `observable<Article | Article[]>`.

```
{
  type: 'item' | 'list'
  payload: Article | Article[];
}
```

## Article:

article is an object contains the following properties:

```
{
  id: string;
  title: string;
  subtitle: string;
  content: string;
  keywords: string | string[];
  cover: string;
  avatar: string;
  link: any;
  auther: any; //todo
}
```

## pref:

pref is an object that contains your preferencies
all properties are optional

```
{
  layout?: 'grid' | 'list';
}
```

# MetaService

you can use MetaService to easly add or modify the meta tags.
to use it add it to `providers[]` in your module.

methods:

```
setTags(tags: Meta = {})
updateTags(tags: Meta)
prepare(key: string, value: any)
filter(tags)
```
