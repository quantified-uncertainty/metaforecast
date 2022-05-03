import { GetServerSideProps } from "next";

import { getPlatformsConfig, PlatformConfig, platforms } from "../../backend/platforms";
import { QuestionFragment } from "../fragments.generated";
import { ssrUrql } from "../urql";
import { FrontpageDocument, SearchDocument } from "./queries.generated";

/* Common code for / and /capture (/capture is deprecated, TODO - refactor) */

export interface QueryParameters {
  query: string;
  starsThreshold: number;
  forecastsThreshold: number;
  forecastingPlatforms: string[]; // platform names
}

export interface Props {
  defaultResults: QuestionFragment[];
  initialQueryParameters: QueryParameters;
  defaultQueryParameters: QueryParameters;
  initialNumDisplay: number;
  defaultNumDisplay: number;
  platformsConfig: PlatformConfig[];
}

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
