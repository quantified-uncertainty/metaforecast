import { addToHistory } from "./addToHistory";
import { createHistoryForMonth } from "./createHistoryForMonth";

export async function updateHistoryOld() {
  let currentDate = new Date();
  let dayOfMonth = currentDate.getDate();
  if (dayOfMonth == 1) {
    console.log(
      `Creating history for the month ${currentDate.toISOString().slice(0, 7)}`
    );
    await createHistoryForMonth();
  } else {
    console.log(`Updating history for ${currentDate.toISOString()}`);
    await addToHistory();
  }
}

export async function updateHistory() {
  let currentDate = new Date();
  let year = currentDate.toISOString().slice(0, 4);
}
