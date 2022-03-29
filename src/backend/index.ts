/* Imports */
import "dotenv/config";

import readline from "readline";
import util from "util";

import { executeJobByName, jobs } from "./flow/jobs";

let generateWhatToDoMessage = () => {
  const color = "\x1b[36m";
  const resetColor = "\x1b[0m";
  let completeMessages = [
    ...jobs.map((job) => {
      return (
        (job.separate ? "\n" : "") +
        `[${color}${job.name}${resetColor}]:`.padStart(30) +
        " " +
        job.message
      );
    }),
    `\nChoose one option, wisely: `,
  ].join("\n");
  return completeMessages;
};

let whattodoMessage = generateWhatToDoMessage();

/* BODY */
let commandLineUtility = async () => {
  const pickOption = async () => {
    if (process.argv.length === 3) {
      return process.argv[2]; // e.g., npm run cli polymarket
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = util.promisify(rl.question).bind(rl);
    const answer = await question(whattodoMessage);
    rl.close();
    return answer;
  };

  await executeJobByName(await pickOption());
  process.exit();
};

commandLineUtility();
