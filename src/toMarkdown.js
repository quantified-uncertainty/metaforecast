/* Imports */
import textVersion from "textversionjs"

/* Definitions */
var styleConfig = {
    linkProcess: function(href, linkText){
        return `[${linkText}](${href})`;
    },
}

/* Support functions */

/* Body */

export default function toMarkdown(htmlText){
  return textVersion(htmlText, styleConfig);
}

toMarkdown()
