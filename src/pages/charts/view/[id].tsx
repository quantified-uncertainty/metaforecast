/* Imports */

import { GetServerSideProps, NextPage } from "next";
import { Layout } from "../../../web/display/Layout";

import React from "react";

import { platforms } from "../../../backend/platforms";
import { HistoryChart } from "../../../web/display/HistoryChart";
import { FrontendForecast } from "../../../web/platforms";
import searchAccordingToQueryData from "../../../web/worker/searchAccordingToQueryData";

interface Props {
  question: FrontendForecast;
  history: number[];
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  let urlQuery = context.query; // this is an object, not a string which I have to parse!!

  let initialQueryParameters = {
    query: "test",
    starsThreshold: 2,
    forecastsThreshold: 0,
    forecastingPlatforms: platforms.map((platform) => platform.name),
    ...urlQuery,
  };

  let results: FrontendForecast[] = [];
  if (initialQueryParameters.query != "") {
    results = await searchAccordingToQueryData(initialQueryParameters, 1);
    console.log(results);
  }

  return {
    props: {
      question: results[0] || null,
      history: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  };
};

const Chart: NextPage<Props> = ({ question, history }) => {
  return (
    <Layout page={"chart"}>
      <div className="w-6/12 mb-4 mt-8 flex flex-row justify-center items-center bg-white">
        <HistoryChart question={question} history={history} />
      </div>
    </Layout>
  );
};

export default Chart;
