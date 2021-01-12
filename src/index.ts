// eslint-disable-next-line max-classes-per-file
import { render } from "velocityjs";
import * as utilCore from "./util";
import * as time from "./util-time";
import * as dynamodb from "./util-dynamodb";

export default class Parser {
  private template: string;

  constructor(template: string) {
    this.template = template;
  }

  /**
   * Resolve as a string
   */
  public resolve(context: Context, additionalUtil?: object): any {
    const clonedContext = JSON.parse(JSON.stringify(context));
    clonedContext.args = clonedContext.arguments;

    const util = {
      ...utilCore,
      time,
      dynamodb,
      ...additionalUtil,
    };

    const params = {
      context: clonedContext,
      ctx: clonedContext,
      util,
      utils: util,
    };

    const res = render(this.template, params);

    // Remove preceding and trailing whitespace
    const resWithoutWhitespace = res
      .replace(/^[\n\s\r]*/, "")
      .replace(/[\n\s\r]*$/, "");

    // Typecast Booleans
    if (res === "false") return false;
    if (res === "true") return true;

    // Typecast Null
    if (res === "null") return null;

    // Typecast Numbers
    // eslint-disable-next-line no-restricted-globals
    if (!isNaN((res as unknown) as number)) return parseFloat(res);

    // Typecast JSON to Object
    try {
      return JSON.parse(res);
      // eslint-disable-next-line no-empty
    } catch (e) {}

    // Return a string otherwise
    return resWithoutWhitespace;
  }
}

export type Context = {
  arguments?: object;
  source?: object;
  result?: object | string;
  identity?: object;
  request?: object;
  info?: object;
  error?: object;
  prev?: object;
  stash?: object;
};

export type velocityParams = { [blockName: string]: boolean };
