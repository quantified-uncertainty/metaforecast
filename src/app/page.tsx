import React from "react";

import {
  getPlatforms,
  getPlatformsConfig,
} from "../backend/platforms/registry";
import { Layout } from "../web/common/Layout";
import {
  QueryParameters,
  SearchScreen,
} from "../web/search/components/SearchScreen";
import {
  FrontpageDocument,
  SearchDocument,
} from "../web/search/queries.generated";
import { getUrqlRscClient } from "../web/urql";

export default async function IndexPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await searchParamsPromise;
  const client = getUrqlRscClient();

  const platformsConfig = getPlatformsConfig();

  const defaultQueryParameters: QueryParameters = {
    query: "",
    starsThreshold: 2,
    forecastsThreshold: 0,
    forecastingPlatforms: getPlatforms().map((platform) => platform.name),
  };

  const initialQueryParameters: QueryParameters = {
    ...defaultQueryParameters,
  };
  if (searchParams.query) {
    initialQueryParameters.query = String(searchParams.query);
  }
  if (searchParams.starsThreshold) {
    initialQueryParameters.starsThreshold = Number(searchParams.starsThreshold);
  }
  if (searchParams.forecastsThreshold !== undefined) {
    initialQueryParameters.forecastsThreshold = Number(
      searchParams.forecastsThreshold
    );
  }
  if (searchParams.forecastingPlatforms !== undefined) {
    initialQueryParameters.forecastingPlatforms = String(
      searchParams.forecastingPlatforms
    ).split("|");
  }

  const defaultNumDisplay = 21;
  const initialNumDisplay =
    Number(searchParams.numDisplay) || defaultNumDisplay;

  const response = await client.query(FrontpageDocument, {});
  if (!response.data) {
    throw new Error(`GraphQL query failed: ${response.error}`);
  }
  const defaultResults = response.data.result;

  if (
    !!initialQueryParameters &&
    initialQueryParameters.query != "" &&
    initialQueryParameters.query != undefined
  ) {
    // must match the query from CommonDisplay
    await client.query(SearchDocument, {
      input: {
        ...initialQueryParameters,
        limit: initialNumDisplay + 50,
      },
    });
  }

  const props = {
    initialQueryParameters,
    defaultQueryParameters,
    initialNumDisplay,
    defaultNumDisplay,
    defaultResults,
    platformsConfig,
  };

  return (
    <Layout page="search">
      <SearchScreen {...props} />
    </Layout>
  );
}
