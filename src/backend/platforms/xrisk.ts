import fs from "fs";

import { hash } from "../utils/hash";
import { Platform } from "./";

const platformName = "xrisk";

export const xrisk: Platform = {
  name: "xrisk",
  label: "X-risk estimates",
  color: "#272600",
  async fetcher() {
    // return; // not necessary to refill the DB every time
    let fileRaw = fs.readFileSync("./input/xrisk-questions.json", {
      encoding: "utf-8",
    });
    let results = JSON.parse(fileRaw);
    results = results.map((item) => ({
      ...item,
      id: `${platformName}-${hash(item.title + " | " + item.url)}`, // some titles are non-unique, but title+url pair is always unique
      platform: platformName,
    }));
    return results;
  },
};
