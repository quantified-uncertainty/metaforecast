/* Imports */
import "dotenv/config";

import readline from "readline";

import { executeJobByName, jobs } from "./flow/jobs";

const generateWhatToDoMessage = () => {
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

const whattodoMessage = generateWhatToDoMessage();

/* BODY */
const commandLineUtility = async () => {
  const pickOption = async () => {
    if (process.argv.length === 3) {
      return process.argv[2]; // e.g., npm run cli polymarket
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (query: string) => {
      return new Promise((resolve: (s: string) => void) => {
        rl.question(query, resolve);
      });
    };

    const answer = await question(whattodoMessage);
    rl.close();

    return answer;
  };

  await executeJobByName(await pickOption());
  process.exit();
};

commandLineUtility();
