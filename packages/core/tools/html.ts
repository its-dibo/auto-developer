import { read } from "./files";
import { Tree, transaction, error as _error } from "./schematics";
import { InsertChange } from "@schematics/angular/utility/change";

//@angular/cdk, jsdom use parse5
import {
  DefaultTreeDocument,
  DefaultTreeElement,
  parse as parseHtml
} from "parse5";

export function error(msg: sting, mark?: string) {
  return _error(msg, "tools/html" + mark ? `/${mark}` : "");
}

//from @angular/cdk (angular/components/src/cdk/utils/html-mainpulation.ts)
export function getElementByTagName(
  tagName: string,
  htmlContent: string
): DefaultTreeElement | null {
  let document = parseHtml(htmlContent, {
    sourceCodeLocationInfo: true
  }) as DefaultTreeDocument;
  let nodeQueue = [...document.childNodes];

  while (nodeQueue.length) {
    let node = nodeQueue.shift() as DefaultTreeElement;

    if (node.nodeName.toLowerCase() === tagName) return node;
    else if (node.childNodes) nodeQueue.push(...node.childNodes);
  }

  return null;
}

//same as target.appendChild(element)
export function insert(
  tree: Tree,
  file: string,
  target: DefaultTreeElement | string, //parent element, ex: <head>
  element: string //the new element to be inserted
) {
  let content = read(tree, file);
  if (!content) error("no content", `insert(${file})`);
  if (content.includes(element)) return;
  if (typeof target === "string")
    (target as DefaultTreeElement) = getElementByTagName(
      target as string,
      content
    );

  if (!target) error(`target ${target} not found`, `insert(${file})`);

  //sourceCodeLocation must be enabled in getElementByTagName()
  //todo: control the location of insertion inside the target element (ex: append, prepend)
  //todo: if(target: Array)target.forEach(el=>insert())
  let endTagOffset = target.sourceCodeLocation!.endTag.startOffset;
  let changes = new InsertChange(file, endTagOffset, element);
  transaction(tree, file, changes, "right");
}

export function addAttribute(
  tree: Tree,
  file: string,
  element: DefaultTreeElement | string,
  name: string,
  value: any
) {
  let content = read(tree, file);
  if (!content) error("no content", `addAttribute(${file}, ${name}: ${value})`);

  if (typeof element === "string")
    (element as DefaultTreeElement) = getElementByTagName(
      element as string,
      content
    );

  if (!element)
    error(
      `element ${element} not found`,
      `addAttribute(${file}, ${name}: ${value})`
    );

  let attr = element.attrs.find(attribute => attribute.name === name);

  if (attr) {
    let hasClass = attr.value
      .split(" ")
      .map(part => part.trim())
      .includes(value);

    if (!hasClass) {
      let attributeLocation = element.sourceCodeLocation!.attrs[name];
      let changes = new InsertChange(
        file,
        attributeLocation.endOffset - 1,
        value
      );
      transaction(tree, file, changes, "right");
    }
  } else {
    let changes = new InsertChange(
      file,
      element.sourceCodeLocation!.startTag.endOffset - 1,
      ` class="${value}"`
    );
    transaction(tree, file, changes, "right");
  }
}
