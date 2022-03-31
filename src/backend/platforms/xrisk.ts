import fs from "fs";

import { Platform } from "./";

export const xrisk: Platform = {
  name: "xrisk",
  async fetcher() {
    return; // not necessary to refill the DB every time
    let fileRaw = fs.readFileSync("./input/xrisk-questions.json", {
      encoding: "utf-8",
    });
    const results = JSON.parse(fileRaw);
    return results;
  },
};
