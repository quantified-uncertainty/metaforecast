import { GetServerSideProps } from "next";

import { getFrontpage } from "../../backend/frontpage";
import { platforms } from "../../backend/platforms";
import { FrontendForecast, PlatformConfig } from "../platforms";
import searchAccordingToQueryData from "../worker/searchAccordingToQueryData";

/* Common code for / and /capture */

export interface QueryParameters {
  query: string;
  starsThreshold: number;
  forecastsThreshold: number;
  forecastingPlatforms: string[]; // platform names
}

export interface Props {
  defaultResults: FrontendForecast[];
  initialResults: FrontendForecast[];
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

  const platformsConfig = platforms.map((platform) => ({
    name: platform.name,
    label: platform.label,
    color: platform.color,
  }));
  platformsConfig.push({
    name: "guesstimate",
    label: "Guesstimate",
    color: "223900",
  });

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

  const platformNameToLabel = Object.fromEntries(
    platforms.map((platform) => [platform.name, platform.label])
  );

  const defaultNumDisplay = 21;
  const initialNumDisplay = Number(urlQuery.numDisplay) || defaultNumDisplay;

  const defaultResults = (await getFrontpage()).map((result) => ({
    ...result,
    platformLabel: platformNameToLabel[result.platform] || result.platform,
  }));

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
