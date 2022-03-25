/* Imports */
import 'dotenv/config';

import readline from 'readline';

import { pgInitialize } from './database/pg-wrapper.js';
import { doEverything, tryCatchTryAgain } from './flow/doEverything.js';
import { updateHistory } from './flow/history/updateHistory.js';
import { mergeEverything } from './flow/mergeEverything.js';
import { rebuildNetlifySiteWithNewData } from './flow/rebuildNetliftySiteWithNewData.js';
import { rebuildFrontpage } from './frontpage';
import { platformFetchers } from './platforms/all-platforms.js';
import { rebuildAlgoliaDatabase } from './utils/algolia.js';

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
let functionNames = functions.map((fun) => fun.name);

let generateWhatToDoMessage = () => {
  let l = platformFetchers.length;
  let messagesForFetchers = platformFetchers.map(
    (fun, i) => `[${i}]: Download predictions from ${fun.name}`
  );
  let otherMessages = [
    "Merge jsons/tables into one big json/table (and push the result to a mongodb/pg database)",
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
    //console.log(functionNames[option])
    if (option < 0) {
      console.log(`Error, ${option} < 0 or ${option} < 0`);
    } else if (option < functions.length) {
      console.log(`Running: ${functions[option].name}\n`);
      await tryCatchTryAgain(functions[option]);
    }
  };

  if (process.argv.length == 3) {
    const option = process.argv[2]; // e.g., npm start 15 <-
    const optionNum = Number(option);
    if (!isNaN(optionNum)) {
      await executeoption(optionNum);
    } else if (option == "all") {
      await executeoption(functions.length - 1); // 15 = execute all fetchers
    } else {
      await whattodo(whattodoMessage, executeoption);
    }
  } else await whattodo(whattodoMessage, executeoption);
};

// console.log("1")
// console.log(process.argv)
commandLineUtility();
// doEverything()
