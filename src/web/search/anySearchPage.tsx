import { GetServerSideProps } from "next";

import { getFrontpage } from "../../backend/frontpage";
import { getPlatformsConfig, PlatformConfig, platforms } from "../../backend/platforms";
import { addLabelsToQuestions, FrontendQuestion } from "../platforms";
import searchAccordingToQueryData from "../worker/searchAccordingToQueryData";

/* Common code for / and /capture */

export interface QueryParameters {
  query: string;
  starsThreshold: number;
  forecastsThreshold: number;
  forecastingPlatforms: string[]; // platform names
}

export interface Props {
  defaultResults: FrontendQuestion[];
  initialResults: FrontendQuestion[];
  initialQueryParameters: QueryParameters;
  defaultQueryParameters: QueryParameters;
  initialNumDisplay: number;
  defaultNumDisplay: number;
  platformsConfig: PlatformConfig[];
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
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

  const defaultResults = addLabelsToQuestions(
    await getFrontpage(),
    platformsConfig
  );

  const initialResults =
    !!initialQueryParameters &&
    initialQueryParameters.query != "" &&
    initialQueryParameters.query != undefined
      ? await searchAccordingToQueryData(
          initialQueryParameters,
          initialNumDisplay
        )
      : defaultResults;

  return {
    props: {
      initialQueryParameters,
      defaultQueryParameters,
      initialNumDisplay,
      defaultNumDisplay,
      initialResults,
      defaultResults,
      platformsConfig,
    },
  };
};
