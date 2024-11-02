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

const askForJobName = async () => {
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

const pickJob = async (): Promise<[string, { [k: string]: string }]> => {
  if (process.argv.length < 3) {
    const jobName = await askForJobName();
    return [jobName, {}]; // e.g., pnpm run cli polymarket
  }

  const jobName = process.argv[2];
  if ((process.argv.length - 3) % 2) {
    throw new Error("Number of extra arguments must be even");
  }

  const args: { [k: string]: string } = {};
  for (let i = 3; i < process.argv.length; i += 2) {
    let argName = process.argv[i];
    const argValue = process.argv[i + 1];
    if (argName.slice(0, 2) !== "--") {
      throw new Error(`${argName} should start with --`);
    }
    argName = argName.slice(2);
    args[argName] = argValue;
  }

  return [jobName, args];
};

/* BODY */
const commandLineUtility = async () => {
  const [jobName, jobArgs] = await pickJob();

  await executeJobByName(jobName, jobArgs);
  process.exit();
};

commandLineUtility();
