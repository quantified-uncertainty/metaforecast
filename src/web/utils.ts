import { IncomingMessage } from "http";

export const reqToBasePath = (req: IncomingMessage) => {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    console.log(process.env.NEXT_PUBLIC_VERCEL_URL);
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // we could just hardcode http://localhost:3000 here, but then `next dev -p <CUSTOM_PORT>` would break
  return "http://" + req.headers.host;
};

export const cleanText = (text: string): string => {
  // Note: should no longer be necessary
  let textString = !!text ? text : "";
  textString = textString
    .replaceAll("] (", "](")
    .replaceAll(") )", "))")
    .replaceAll("( [", "([")
    .replaceAll(") ,", "),")
    .replaceAll("==", "") // Denotes a title in markdown
    .replaceAll("Background\n", "")
    .replaceAll("Context\n", "")
    .replaceAll("--- \n", "- ")
    .replaceAll(/\[(.*?)\]\(.*?\)/g, "$1");
  textString = textString.slice(0, 1) == "=" ? textString.slice(1) : textString;
  //console.log(textString)
  return textString;
};
