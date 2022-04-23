import algoliasearch from "algoliasearch";

import { AlgoliaQuestion } from "../../backend/utils/algolia";

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
);
const index = client.initIndex("metaforecast");

let buildFilter = ({
  starsThreshold,
  filterByPlatforms,
  forecastsThreshold,
}) => {
  const starsFilter = starsThreshold
    ? `qualityindicators.stars >= ${starsThreshold}`
    : null;
  const platformsFilter = filterByPlatforms
    ? filterByPlatforms.map((platform) => `platform:"${platform}"`).join(" OR ")
    : null;
  const numForecastsFilter =
    forecastsThreshold > 0
      ? `qualityindicators.numforecasts >= ${forecastsThreshold}`
      : null;
  const finalFilter = [starsFilter, platformsFilter, numForecastsFilter]
    .filter((f) => f != null)
    .map((f) => `( ${f} )`)
    .join(" AND ");

  console.log(
    "searchWithAlgolia.js/searchWithAlgolia/buildFilter",
    finalFilter
  );
  return finalFilter;
};

let buildFacetFilter = ({ filterByPlatforms }) => {
  let platformsFilter = [];
  if (filterByPlatforms.length > 0) {
    platformsFilter = [
      [filterByPlatforms.map((platform) => `platform:${platform}`)],
    ];
  }
  console.log(platformsFilter);
  console.log(
    "searchWithAlgolia.js/searchWithAlgolia/buildFacetFilter",
    platformsFilter
  );
  return platformsFilter;
};

let noExactMatch = (queryString, result) => {
  queryString = queryString.toLowerCase();
  let title = result.title.toLowerCase();
  let description = result.description.toLowerCase();
  let optionsstringforsearch = result.optionsstringforsearch.toLowerCase();
  return !(
    title.includes(queryString) ||
    description.includes(queryString) ||
    optionsstringforsearch.includes(queryString)
  );
};

interface SearchOpts {
  queryString: string;
  hitsPerPage?: number;
  starsThreshold: number;
  filterByPlatforms: string[];
  forecastsThreshold: number;
}

// only query string
export default async function searchWithAlgolia({
  queryString,
  hitsPerPage = 5,
  starsThreshold,
  filterByPlatforms,
  forecastsThreshold,
}: SearchOpts): Promise<AlgoliaQuestion[]> {
  const response = await index.search<AlgoliaQuestion>(queryString, {
    hitsPerPage,
    filters: buildFilter({
      starsThreshold,
      forecastsThreshold,
      filterByPlatforms,
    }),
    //facetFilters: buildFacetFilter({filterByPlatforms}),
    getRankingInfo: true,
  });
  let results = response.hits;

  let recursionError = ["metaforecast", "metaforecasts", "metaforecasting"];
  if (
    (!results || results.length == 0) &&
    !recursionError.includes(queryString.toLowerCase())
  ) {
    results = [
      {
        id: "not-found",
        objectID: "not-found",
        title: "No search results match your query",
        url: "https://metaforecast.org",
        platform: "metaforecast",
        description: "Maybe try a broader query?",
        options: [
          {
            name: "Yes",
            probability: 0.995,
            type: "PROBABILITY",
          },
          {
            name: "No",
            probability: 0.005,
            type: "PROBABILITY",
          },
        ],
        timestamp: `${new Date().toISOString().slice(0, 10)}`,
        qualityindicators: {
          numforecasts: 1,
          numforecasters: 1,
          stars: 5,
        },
        extra: {},
      },
    ];
  } else if (recursionError.includes(queryString.toLowerCase())) {
    results = [
      {
        id: "recursion-error",
        objectID: "recursion-error",
        title: `Did you mean: ${queryString}?`,
        url: "https://metaforecast.org/recursion?bypassEasterEgg=true",
        platform: "metaforecast",
        description:
          "Fatal error: Too much recursion. Click to proceed anyways",
        options: [
          {
            name: "Yes",
            probability: 0.995,
            type: "PROBABILITY",
          },
          {
            name: "No",
            probability: 0.005,
            type: "PROBABILITY",
          },
        ],
        timestamp: `${new Date().toISOString().slice(0, 10)}`,
        qualityindicators: {
          numforecasts: 1,
          numforecasters: 1,
          stars: 5,
        },
        extra: {},
      },
      ...results,
    ];
  } else if (
    queryString &&
    queryString.split(" ").length == 1 &&
    noExactMatch(queryString, results[0])
  ) {
    results.unshift({
      id: "not-found-2",
      objectID: "not-found-2",
      title: "No search results appear to match your query",
      url: "https://metaforecast.org",
      platform: "metaforecast",
      description: "Maybe try a broader query? That said, we could be wrong.",
      options: [
        {
          name: "Yes",
          probability: 0.65,
          type: "PROBABILITY",
        },
        {
          name: "No",
          probability: 0.35,
          type: "PROBABILITY",
        },
      ],
      timestamp: `${new Date().toISOString().slice(0, 10)}`,
      qualityindicators: {
        numforecasts: 1,
        numforecasters: 1,
        stars: 1,
      },
      extra: {},
    });
  }

  return results;
}
// Examples:
// searchWithAlgolia({queryString: "Life"}, () => null)
// searchWithAlgolia({queryString: "Life", forecastsThreshold: 100}, () => null)
// searchWithAlgolia({queryString: "Life", forecastsThreshold: 100, starsThreshold: 4}, () => null)
// searchWithAlgolia({queryString: "Life", forecastsThreshold: 100, starsThreshold: 3, filterByPlatforms: ["Metaculus", "PolyMarket"]}, () => null)
