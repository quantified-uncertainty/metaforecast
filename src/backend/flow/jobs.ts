import { doEverything } from "../flow/doEverything";
import { rebuildFrontpage } from "../frontpage";
import { platforms, processPlatform } from "../platforms";
import { rebuildAlgoliaDatabase } from "../utils/algolia";
import { sleep } from "../utils/sleep";

interface Job {
  name: string;
  message: string;
  run: () => Promise<void>;
  separate?: boolean;
}

export const jobs: Job[] = [
  ...platforms.map((platform) => ({
    name: platform.name,
    message: `Download predictions from ${platform.name}`,
    run: () => processPlatform(platform),
  })),
  {
    name: "algolia",
    message: 'Rebuild algolia database ("index")',
    run: rebuildAlgoliaDatabase,
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
];

async function tryCatchTryAgain(fun: () => Promise<void>) {
  try {
    console.log("Initial try");
    await fun();
  } catch (error) {
    sleep(10000);
    console.log("Second try");
    console.log(error);
    try {
      await fun();
    } catch (error) {
      console.log(error);
    }
  }
}

export const executeJobByName = async (option: string) => {
  const job = jobs.find((job) => job.name === option);
  if (!job) {
    console.log(`Error, job ${option} not found`);
  } else {
    await tryCatchTryAgain(job.run);
  }
};
