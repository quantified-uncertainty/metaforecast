import { IncomingMessage } from "http";

export const reqToBasePath = (req: IncomingMessage) => {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return process.env.NEXT_PUBLIC_VERCEL_URL;
  }

  // we could just hardcode http://localhost:3000 here, but then `next dev -p <CUSTOM_PORT>` would break
  return "http://" + req.headers.host;
};
