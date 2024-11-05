import React from "react";

import {
  FrontpageDocument,
  SearchDocument,
} from "@/app/(nav)/queries.generated";
import { getPlatforms, getPlatformsConfig } from "@/backend/platforms/registry";
import { QuestionFragment } from "@/web/fragments.generated";
import { getUrqlRscClient } from "@/web/urql";

import { searchParamsToQuery, SearchQuery } from "./common";
import { QuestionCardsList } from "./QuestionCardsList";
import { SearchForm } from "./SearchForm";
import { SearchUIProvider } from "./SearchUIProvider";
import { ShowMore } from "./ShowMore";

async function getResults(searchQuery: SearchQuery): Promise<{
  results: QuestionFragment[];
  hasMore: boolean;
}> {
  const client = getUrqlRscClient();

  const withLimit = (results: QuestionFragment[]) => ({
    results: results.slice(0, searchQuery.limit),
    hasMore: results.length > searchQuery.limit,
  });

  if (searchQuery.query) {
    // search

    const response = await client.query(SearchDocument, {
      input: {
        ...searchQuery,
        limit: searchQuery.limit + 1,
      },
    });
    if (!response.data) {
      throw new Error(`GraphQL query failed: ${response.error}`);
    }
    return withLimit(response.data.result);
  } else {
    // default front page, possibly with platform and stars filters

    // this is necessary because FrontpageDocument does not support filtering, and SearchDocument requires a text query
    const filterManually = (results: QuestionFragment[]) => {
      let filteredResults = [...results];
      if (
        searchQuery.forecastingPlatforms &&
        searchQuery.forecastingPlatforms.length > 0
      ) {
        filteredResults = filteredResults.filter((result) =>
          searchQuery.forecastingPlatforms.includes(result.platform.id)
        );
      }
      if (searchQuery.starsThreshold === 4) {
        filteredResults = filteredResults.filter(
          (result) => result.qualityIndicators.stars >= 4
        );
      }
      if (searchQuery.forecastsThreshold) {
        // TODO / FIXME / remove?
      }
      return filteredResults;
    };

    const response = await client.query(FrontpageDocument, {});
    if (!response.data) {
      throw new Error(`GraphQL query failed: ${response.error}`);
    }
    return withLimit(filterManually(response.data.result));
  }
}

export default async function IndexPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await searchParamsPromise;
  const searchQuery = searchParamsToQuery(
    searchParams,
    getPlatforms().map((platform) => platform.name)
  );

  const { results, hasMore } = await getResults(searchQuery);

  // I don't want the component which display questions (DisplayQuestions) to change with a change in queryParameters. But I want it to have access to the queryParameters, and in particular access to queryParameters.numDisplay. Hence why this function lives inside Home.
  const getInfoToDisplayQuestions = () => {
    const { length } = results;

    const roundedLength =
      length % 3 !== 0 ? length + (3 - (Math.round(length) % 3)) : length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuestionCardsList results={results.slice(0, roundedLength)} />
      </div>
    );
  };

  /* Final return */
  return (
    <SearchUIProvider>
      <SearchForm platformsConfig={getPlatformsConfig()} />
      <div>{getInfoToDisplayQuestions()}</div>

      {!results || hasMore ? (
        <div>
          <p className="my-4">
            {"Can't find what you were looking for?"}
            <ShowMore />
            {" or "}
            <a
              href="https://www.metaculus.com/questions/create/"
              className="cursor-pointer text-blue-800 no-underline"
              target="_blank"
            >
              suggest a question on Metaculus
            </a>
          </p>
        </div>
      ) : null}
    </SearchUIProvider>
  );
}
