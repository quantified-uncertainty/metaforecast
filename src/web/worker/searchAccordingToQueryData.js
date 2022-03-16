import searchWithAlgolia from "./searchWithAlgolia.js";
import searchGuesstimate from "./searchGuesstimate.js";

export default async function searchAccordingToQueryData(queryData) {
  let results = [];

  try {
    // defs
    let query = queryData.query == undefined ? "" : queryData.query;
    if (query == "") return -1;
    let forecastsThreshold = queryData.forecastsThreshold;
    let starsThreshold = queryData.starsThreshold;
    let forecastingPlatforms = queryData.forecastingPlatforms.map(
      (x) => x.value
    );
    let platformsIncludeGuesstimate =
      forecastingPlatforms.includes("Guesstimate") && starsThreshold <= 1;

    // preparation
    let unawaitedAlgoliaResponse = searchWithAlgolia({
      queryString: query,
      hitsPerPage: queryData.numDisplay + 50,
      starsThreshold,
      filterByPlatforms: forecastingPlatforms,
      forecastsThreshold,
    });

    // consider the guesstimate and the non-guesstimate cases separately.
    switch (platformsIncludeGuesstimate) {
      case false:
        results = await unawaitedAlgoliaResponse;
        break;
      case true:
        let responses = await Promise.all([
          unawaitedAlgoliaResponse,
          searchGuesstimate(query),
        ]); // faster than two separate requests
        let responsesNotGuesstimate = responses[0];
        let responsesGuesstimate = responses[1];
        results = [...responsesNotGuesstimate, ...responsesGuesstimate];
        //results.sort((x,y)=> x.ranking < y.ranking ? -1: 1)
        break;
      default:
        return -1;
    }
    // Maintain compatibility with fuse
    let makeCompatibleWithFuse = (results) =>
      results.map((result, index) => ({
        item: result,
        score: 0, // 0.4 - 0.4 / (index + 1),
      }));

    results = makeCompatibleWithFuse(results);
  } catch (error) {
    console.log(error);
  } finally {
    console.log(results);
    return results;
  }
}
