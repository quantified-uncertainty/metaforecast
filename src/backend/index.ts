/* Imports */
import 'dotenv/config';

import readline from 'readline';

import { pgInitialize } from './database/pg-wrapper';
import { doEverything, tryCatchTryAgain } from './flow/doEverything';
import { updateHistory } from './flow/history/updateHistory';
import { mergeEverything } from './flow/mergeEverything';
import { rebuildNetlifySiteWithNewData } from './flow/rebuildNetliftySiteWithNewData';
import { rebuildFrontpage } from './frontpage';
import { platformFetchers } from './platforms/all-platforms';
import { rebuildAlgoliaDatabase } from './utils/algolia';

/* Support functions */
let functions = [
  ...platformFetchers,
  mergeEverything,
  rebuildAlgoliaDatabase,
  updateHistory,
  rebuildNetlifySiteWithNewData,
  doEverything,
  pgInitialize,
  rebuildFrontpage,
];

let generateWhatToDoMessage = () => {
  let l = platformFetchers.length;
  let messagesForFetchers = platformFetchers.map(
    (fun, i) => `[${i}]: Download predictions from ${fun.name}`
  );
  let otherMessages = [
    "Merge tables into one big table (and push the result to a pg database)",
    `Rebuild algolia database ("index")`,
    `Update history`,
    `Rebuild netlify site with new data`,
    // `\n[${functionNames.length-1}]: Add to history` +
    `All of the above`,
    `Initialize postgres database`,
    "Rebuild frontpage",
  ];
  let otherMessagesWithNums = otherMessages.map(
    (message, i) => `[${i + l}]: ${message}`
  );
  let completeMessages = [
    ...messagesForFetchers,
    ...otherMessagesWithNums,
    `\nChoose one option, wisely: #`,
  ].join("\n");
  return completeMessages;
};

let whattodoMessage = generateWhatToDoMessage();

/* BODY */
let commandLineUtility = async () => {
  let whattodo = async (message, callback) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(message, async (answer) => {
      rl.close();
      await callback(answer);
    });
  };

  let executeoption = async (option) => {
    option = Number(option);
    if (option < 0) {
      console.log(`Error, ${option} < 0`);
    } else if (option < functions.length) {
      console.log(`Running: ${functions[option].name}\n`);
      await tryCatchTryAgain(functions[option]);
    }
    process.exit();
  };

  if (process.argv.length == 3) {
    const option = process.argv[2]; // e.g., npm start 15 <-
    const optionNum = Number(option);
    if (!isNaN(optionNum)) {
      await executeoption(optionNum);
    } else if (option == "all") {
      await executeoption(functions.length - 3); // doEverything
    } else {
      await whattodo(whattodoMessage, executeoption);
    }
  } else await whattodo(whattodoMessage, executeoption);
};

commandLineUtility();
