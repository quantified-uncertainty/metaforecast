import { databaseRead, databaseUpsert } from "../../database/database-wrapper";

export async function createHistoryForMonth() {
  let currentDate = new Date();
  let dateUpToMonth = currentDate.toISOString().slice(0, 7).replace("-", "_");
  let metaforecasts = await databaseRead({ group: "combined" });
  let metaforecastsHistorySeed = metaforecasts
    .map((element) => {
      // let moreoriginsdata = element.author ? ({author: element.author}) : ({})
      return {
        title: element.title,
        url: element.url,
        platform: element.platform,
        moreoriginsdata: element.moreoriginsdata || {},
        description: element.description,
        history: [
          {
            timestamp: element.timestamp,
            options: element.options,
            qualityindicators: element.qualityindicators,
          },
        ],
        extra: element.extra || {},
      };
    })
    .filter(
      (element) =>
        element.platform != "Metaculus" && element.platform != "Estimize"
    );
  //console.log(metaforecastsHistorySeed)
  await databaseUpsert({
    contents: metaforecastsHistorySeed,
    group: "history",
  });
}
////createInitialHistory()
