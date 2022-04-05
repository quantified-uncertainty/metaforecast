/* Imports */

import { GetServerSideProps, NextPage } from "next";
import React from "react";

import { platforms } from "../backend/platforms";
import { DisplayForecast } from "../web/display/DisplayForecast";
import { FrontendForecast } from "../web/platforms";
import searchAccordingToQueryData from "../web/worker/searchAccordingToQueryData";

interface Props {
  results: FrontendForecast[];
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  let urlQuery = context.query; // this is an object, not a string which I have to parse!!

  let initialQueryParameters = {
    query: "",
    starsThreshold: 2,
    forecastsThreshold: 0,
    forecastingPlatforms: platforms.map((platform) => platform.name),
    ...urlQuery,
  };

  let results: FrontendForecast[] = [];
  if (initialQueryParameters.query != "") {
    results = await searchAccordingToQueryData(initialQueryParameters, 1);
  }

  return {
    props: {
      results: results,
    },
  };
};

const SecretEmbedPage: NextPage<Props> = ({ results }) => {
  let result = results.length ? results[0] : null;

  return (
    <div className="mb-4 mt-8 flex flex-row justify-center items-center">
      <div className="w-6/12 place-self-center">
        <div>
          <div id="secretEmbed">
            {result ? (
              <DisplayForecast
                forecast={result}
                showTimeStamp={true}
                expandFooterToFullWidth={true}
              />
            ) : null}
          </div>
          <br></br>
          <div id="secretObject">
            {result ? JSON.stringify(result, null, 4) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretEmbedPage;
