import { FrontendQuestion } from "../platforms";
import { QueryParameters } from "../search/anySearchPage";
import searchGuesstimate from "./searchGuesstimate";
import searchWithAlgolia from "./searchWithAlgolia";

export default async function searchAccordingToQueryData(
  queryData: QueryParameters,
  limit: number
): Promise<FrontendQuestion[]> {
  let results: FrontendQuestion[] = [];

  try {
    // defs
    let query = queryData.query == undefined ? "" : queryData.query;
    if (query == "") return [];
    let forecastsThreshold = queryData.forecastsThreshold;
    let starsThreshold = queryData.starsThreshold;
    let platformsIncludeGuesstimate =
      queryData.forecastingPlatforms.includes("guesstimate") &&
      starsThreshold <= 1;

    // preparation
    let unawaitedAlgoliaResponse = searchWithAlgolia({
      queryString: query,
      hitsPerPage: limit + 50,
      starsThreshold,
      filterByPlatforms: queryData.forecastingPlatforms,
      forecastsThreshold,
    });

    // consider the guesstimate and the non-guesstimate cases separately.
    if (platformsIncludeGuesstimate) {
      let responses = await Promise.all([
        unawaitedAlgoliaResponse,
        searchGuesstimate(query),
      ]); // faster than two separate requests
      let responsesNotGuesstimate = responses[0];
      let responsesGuesstimate = responses[1];
      results = [...responsesNotGuesstimate, ...responsesGuesstimate];
      //results.sort((x,y)=> x.ranking < y.ranking ? -1: 1)
    } else {
      results = await unawaitedAlgoliaResponse;
    }

    return results;
  } catch (error) {
    console.log(error);
  } finally {
    console.log(results);
    return results;
  }
}
