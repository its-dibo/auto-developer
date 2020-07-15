import sharp from "sharp";
import { parsePath } from "../nodejs-tools/fs";
import { existsSync } from "fs";

export { sharp };

export interface ResizeOptions {
  format?: string;
  withMetadata?: boolean;
  output?:
    | string
    | boolean
    | ((img: string | Buffer, size: number[], options: any) => string);
  [key: string]: any;
}
/**
 * [resize description]
 * @method resize
 * @param  {string | Buffer} img     file path or image buffer;
 * @param  {number | string | Array[number | string]} size    width or [width, height] or 'width,height'
 * @param  {[type]} options [description]
 * @return Promise<info>
 */
export function resize(
  img: string | Buffer | sharp,
  size: number | string | Array<number | string>,
  options?: ResizeOptions
): Promise<any> {
  options = options || {};

  if (
    typeof img == "string" &&
    (img.indexOf("data:image/") === 0 || options.input == "base64")
  )
    img = Buffer.from(img.replace(/data:image\/.+?;base64,/, ""), "base64");

  if (!(img instanceof sharp)) img = sharp(img, options.sharp);

  if (options.output == "")
    Promise.reject(
      "options.output cannot be empty, to get a Buffer, remove this option or use options.output='buffer'."
    );

  //todo: img: Obj{width,height,..} -> sharp({create:{ .. }});
  if (!size) size = [null, null];
  else if (typeof size == "string") size = size.split(",");
  else if (typeof size == "number") size = [size, null];

  //passing (0) to img.resize() will not generate the image.
  //+el: to convert into number
  //don't use (size as number[]|string[]).map()  https://stackoverflow.com/a/49511416/12577650
  size = (size as Array<number | string>).map(el =>
    !el || el === 0 ? null : +el
  );

  //Include all metadata (EXIF, XMP, IPTC) from the input image in the output image
  if (options.withMetadata !== false) img = img.withMetadata();

  return img.metadata().then(metadata => {
    if (
      !size[0] &&
      !size[1] &&
      (!options.format || options.format == metadata.format)
    )
      Promise.reject(
        "width & height can be dismissed only when the image converted into another format, use options.format"
      );

    img = img.resize(size[0], size[1], options.resize);
    if (options.format) img = img.toFormat(options.format);
    if (options.output === "buffer" || !options.output) img = img.toBuffer();
    else if (options.output === "base64")
      img = img
        .toBuffer()
        .then(
          data =>
            `data:image/${options.format ||
              metadata.format};base64,${data.toString("base64")}`
        );
    else {
      if (typeof options.output == "function")
        options.output = options.output(img, <number[]>size, options);
      else if (options.output === true) {
        //automatically set the destination output
        let parts = parsePath(img);
        options.output = `${parts.dir}/${parts.file}_${size[0]}${
          size[1] ? "X" + size[1] : ""
        }${parts.extension}`;
      }
      img = img
        .toFile(options.output)
        .then(info => ({ options, metadata, ...info }));
    }

    return img;
  });
}

/**
 * create resized version of an image.
 * @method resizeAll
 * @param  img    image path or Buffer
 * @param sizes    [array of sizes]
 * @return Promise<any>
 */

export function resizeAll(img, sizes: Array<any>, options) {
  return Promise.all(sizes.map(size => size => resize(img, size, options)));
}
