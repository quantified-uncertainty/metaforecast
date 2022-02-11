import crypto from "crypto";

export const hash = (string) =>
  crypto.createHash("sha256").update(string).digest("hex").slice(0, 10);
