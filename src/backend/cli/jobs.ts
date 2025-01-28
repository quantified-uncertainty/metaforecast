import { rebuildFrontpage } from "../frontpage";
import {
  importMarketsFromJsonArchiveFile,
  importSingleMarket,
} from "../platforms/manifold/extended";
import { getPlatforms } from "../platforms/registry";
import { processPlatform } from "../robot";
import { rebuildElasticDatabase } from "../utils/elastic";
import { sleep } from "../utils/sleep";
import { doEverything } from "./doEverything";

type Job<ArgNames extends string = ""> = {
  name: string;
  message: string;
  args?: ArgNames[];
  run: (args?: { [k in ArgNames]: string }) => Promise<void>;
  retry?: boolean;
  separate?: boolean;
};

export const jobs: Job<string>[] = [
  ...getPlatforms().map((platform) => ({
    name: platform.name,
    message: `Download predictions from ${platform.name}`,
    ...(platform.version === "v2" ? { args: platform.fetcherArgs } : {}),
    run: (args: any) => processPlatform(platform, args),
  })),
  {
    name: "elastic",
    message: "Rebuild Elasticsearch database",
    run: rebuildElasticDatabase,
  },
  {
    name: "frontpage",
    message: "Rebuild frontpage",
    run: rebuildFrontpage,
  },
  {
    name: "all",
    message: "All of the above",
    run: doEverything,
    separate: true,
  },
  {
    name: "manifold-json",
    message: "Process all Manifold markets from a JSON archive",
    retry: false,
    args: ["filename"],
    run: async (args) => {
      if (!args?.filename) {
        throw new Error("filename is required");
      }
      await importMarketsFromJsonArchiveFile(args.filename);
    },
  },
  {
    name: "manifold-one",
    message: "Download a single Manifold market",
    retry: false,
    args: ["id"],
    run: async (args) => {
      if (!args?.id) {
        throw new Error("id is required");
      }
      await importSingleMarket(args.id);
    },
  },
];

async function tryCatchTryAgain<T extends object = never>(
  fun: (args: T) => Promise<void>,
  args: T
) {
  try {
    console.log("Initial try");
    await fun(args);
  } catch (error) {
    sleep(10000);
    console.log("Second try");
    console.log(error);
    try {
      await fun(args);
    } catch (error) {
      console.log(error);
    }
  }
}

export async function executeJobByName(
  jobName: string,
  jobArgs: { [k: string]: string } = {}
) {
  const job = jobs.find((job) => job.name === jobName);
  if (!job) {
    console.log(`Error, job ${jobName} not found`);
    return;
  }
  for (const key of Object.keys(jobArgs)) {
    if (!job.args || job.args.indexOf(key) < 0) {
      throw new Error(`Job ${jobName} doesn't accept ${key} argument`);
    }
  }

  if (job.retry) {
    await tryCatchTryAgain(job.run, jobArgs);
  } else {
    await job.run(jobArgs);
  }
}
