import { GetServerSideProps, NextPage } from "next";
import React from "react";

import { getPlatformsConfig, platforms } from "../backend/platforms";
import { Layout } from "../web/common/Layout";
import { Props, QueryParameters, SearchScreen } from "../web/search/components/SearchScreen";
import { FrontpageDocument, SearchDocument } from "../web/search/queries.generated";
import { ssrUrql } from "../web/urql";

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const [ssrCache, client] = ssrUrql();
  const urlQuery = context.query;

  const platformsConfig = getPlatformsConfig({ withGuesstimate: true });

  const defaultQueryParameters: QueryParameters = {
    query: "",
    starsThreshold: 2,
    forecastsThreshold: 0,
    forecastingPlatforms: platforms.map((platform) => platform.name),
  };

  const initialQueryParameters: QueryParameters = {
    ...defaultQueryParameters,
  };
  if (urlQuery.query) {
    initialQueryParameters.query = String(urlQuery.query);
  }
  if (urlQuery.starsThreshold) {
    initialQueryParameters.starsThreshold = Number(urlQuery.starsThreshold);
  }
  if (urlQuery.forecastsThreshold !== undefined) {
    initialQueryParameters.forecastsThreshold = Number(
      urlQuery.forecastsThreshold
    );
  }
  if (urlQuery.forecastingPlatforms !== undefined) {
    initialQueryParameters.forecastingPlatforms = String(
      urlQuery.forecastingPlatforms
    ).split("|");
  }

  const defaultNumDisplay = 21;
  const initialNumDisplay = Number(urlQuery.numDisplay) || defaultNumDisplay;

  const defaultResults = (await client.query(FrontpageDocument).toPromise())
    .data.result;

  if (
    !!initialQueryParameters &&
    initialQueryParameters.query != "" &&
    initialQueryParameters.query != undefined
  ) {
    // must match the query from CommonDisplay
    await client
      .query(SearchDocument, {
        input: {
          ...initialQueryParameters,
          limit: initialNumDisplay,
        },
      })
      .toPromise();
  }

  return {
    props: {
      urqlState: ssrCache.extractData(),
      initialQueryParameters,
      defaultQueryParameters,
      initialNumDisplay,
      defaultNumDisplay,
      defaultResults,
      platformsConfig,
    },
  };
};

const IndexPage: NextPage<Props> = (props) => {
  return (
    <Layout page="search">
      <SearchScreen {...props} />
    </Layout>
  );
};

export default IndexPage;
