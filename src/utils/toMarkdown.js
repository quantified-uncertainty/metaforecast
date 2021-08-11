/* Imports */
import textVersion from "textversionjs"

/* Definitions */
var styleConfig = {
    linkProcess: function(href, linkText){
      let newHref = href ? href.replace(/\(/g, "%28").replace(/\)/g, "%29") : "" 
        // Deal corretly in markdown with links that contain parenthesis
      return `[${linkText}](${newHref})`;
    },
}

/* Support functions */

/* Body */

export default function toMarkdown(htmlText){
  return textVersion(htmlText, styleConfig);
}

// toMarkdown()
