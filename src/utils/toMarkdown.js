/* Imports */
import textVersion from "textversionjs"

/* Definitions */
String.prototype.replaceAll = function replaceAll(search, replace) { return this.split(search).join(replace); }

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
  let html2 = htmlText.replaceAll(`='`, `="`).replaceAll(`'>`, `">`)
  return textVersion(html2, styleConfig);
}

// toMarkdown() 
// console.log(toMarkdown("Context:Many intellectual endeavors require mathematical problem solving, but this skill remains beyond the capabilities of computers. To help advance the art, the <a target=_new href='https://github.com/hendrycks/math/'>MATH</a> dataset offers..."))
