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

async function fakeGetQuestionByIdBinary(id) {
  return {
    id: "infer-958",
    title:
      "In the next six months, will U.S. and China announce the establishment of an ongoing bilateral dialog mechanism that includes discussions of emerging technologies?",
    url: "https://www.infer-pub.com/questions/958-in-the-next-six-months-will-u-s-and-china-announce-the-establishment-of-an-ongoing-bilateral-dialog-mechanism-that-includes-discussions-of-emerging-technologies",
    platform: "infer",
    platformLabel: "Infer",
    description:
      "The National Security Commission on Artificial Intelligence argues that establishing a regular, high-level diplomatic dialogue with China about artificial intelligence is key to developing and executing a strategy on how to remain competitive and safe as AI technology changes the world ([NSCAI Report Chapter 9](https://reports.nscai.gov/final-report/chapter-9/)). Examples of ongoing bilateral dialog mechanisms are the [Strategic and Economic Dialog](https://china.usc.edu/statements-obama-hu-bilateral-meeting-april-1-2009) under President Obama ([National Committee on American Foreign Policy—NCAFP](https://www.ncafp.org)), the [Comprehensive Economic Dialog](https://www.deccanherald.com/content/605333/trump-xi-establish-us-china.html) under President Trump, and the [Strategic Economic Dialog](https://www.treasury.gov/press-center/press-releases/pages/hp107.aspx) under President George W. Bush. Emerging technologies (e.g. artificial intelligence, quantum computing, and biotech) must be a core component of the dialog structure. \n",
    options: [
      {
        name: "Yes",
        type: "PROBABILITY",
        probability: 0.0351,
      },
      {
        name: "No",
        type: "PROBABILITY",
        probability: 0.9649,
      },
    ],
    timestamp: "2022-04-19T13:09:13.000Z",
    stars: 2,
    qualityindicators: {
      stars: 2,
      numforecasts: 164,
      comments_count: 171,
      numforecasters: 64,
    },
    extra: [],
  };
}

async function fakeGetHistoryQuestionById(id) {
  let l = 30;

  let history = Array.from(Array(l).keys()).map((x) => ({
    timestamp: `2022-04-${`0${x + 1}`.slice(-2)}T13:09:13.000Z`,
    options: [
      {
        name: "X",
        type: "PROBABILITY",
        probability: 0.0351 + Math.abs(Math.sin(3 * x)) / 2,
      },
      {
        name: "Y",
        type: "PROBABILITY",
        probability: 0.9649 - Math.abs(Math.sin(3 * x)) / 2,
      },
    ],
  }));
  return history;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  let urlQuery = context.query; // this is an object, not a string which I have to parse!!

  let initialQueryParameters = {
    id: null,
    ...urlQuery,
  };

  let question: FrontendForecast;
  let history: any[]; // replace with prop def.
  if (initialQueryParameters.id != null) {
    question = await fakeGetQuestionByIdBinary(initialQueryParameters.id);
    history = await fakeGetHistoryQuestionById(initialQueryParameters.id);
  }

  return {
    props: {
      question: question,
      history: history,
    },
  };
};

const Chart: NextPage<Props> = ({ question, history }) => {
  return (
    <Layout page={"chart"}>
      <div className="flex flex-col w-12/12 mb-4 mt-8 justify-center items-center self-center">
        <HistoryChart question={question} history={history} />
      </div>
    </Layout>
  );
};

export default Chart;

/*

async function fakeGetQuestionByIdMultipleOptions(id) {
  return {
    id: "infer-954",
    title:
      "Will the U.S. Congress pass a tax credit for semiconductor manufacturing or design before 1 January 2023?",
    url: "https://www.infer-pub.com/questions/954-will-the-u-s-congress-pass-a-tax-credit-for-semi-conductor-manufacturing-or-design-before-1-january-2023",
    platform: "infer",
    platformLabel: "Infer",
    description:
      "The National Security Commission on Artificial Intelligence identified developments in micro-electronics and semiconductors as critical to the United States&#39; competitive strategy ([NSCAI Chapter 13](https://reports.nscai.gov/final-report/chapter-13/)). The Facilitating American-Built Semiconductors Act would offer an investment tax credit for investments in semiconductor manufacturing ([Congress.Gov](https://www.congress.gov/bill/117th-congress/senate-bill/2107/text?r=68&amp;s=1), [Senate Finance](https://www.finance.senate.gov/chairmans-news/wyden-crapo-cornyn-warner-daines-stabenow-introduce-bill-to-boost-domestic-manufacturing-of-semiconductors)). Tech companies are lobbying not only for passage, but for expansion of the credit to cover semiconductor design as well ([Bloomberg](https://www.bloomberg.com/news/articles/2021-12-01/corporate-leaders-push-congress-to-speed-aid-for-semiconductors), [SIA](https://www.semiconductors.org/sia-applauds-senate-introduction-of-fabs-act/)).\n",
    options: [
      {
        name: "Yes, for both manufacturing and design ",
        type: "PROBABILITY",
        probability: 0.4129,
      },
      {
        name: "Yes, for only manufacturing",
        type: "PROBABILITY",
        probability: 0.3103,
      },
      {
        name: "Yes, for only design",
        type: "PROBABILITY",
        probability: 0.0235,
      },
      {
        name: "No",
        type: "PROBABILITY",
        probability: 0.2533,
      },
    ],
    timestamp: "2022-04-19T13:09:21.000Z",
    stars: 2,
    qualityindicators: {
      stars: 2,
      numforecasts: 156,
      comments_count: 168,
      numforecasters: 66,
    },
    extra: [],
  };
}


 */
