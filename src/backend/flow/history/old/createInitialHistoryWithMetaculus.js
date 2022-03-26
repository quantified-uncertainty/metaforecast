import { databaseRead, databaseUpsert } from "../database-wrapper";

let createInitialHistory = async () => {
  let metaforecasts = await databaseRead({ group: "combined" });
  let metaforecastsHistorySeed = metaforecasts.map((element) => {
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
  });
  console.log(metaforecastsHistorySeed);
  await databaseUpsert({
    contents: metaforecastsHistorySeed,
    group: "history",
  });
};
createInitialHistory();
