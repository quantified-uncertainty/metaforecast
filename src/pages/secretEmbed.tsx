/* Imports */

import { GetServerSideProps, NextPage } from "next";
import React from "react";

import { platforms } from "../backend/platforms";
import { QuestionFragment } from "../web/fragments.generated";
import { QuestionCard } from "../web/questions/components/QuestionCard";
import { SearchDocument } from "../web/search/queries.generated";
import { ssrUrql } from "../web/urql";

interface Props {
  results: QuestionFragment[];
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const [ssrCache, client] = ssrUrql();
  let urlQuery = context.query;

  let initialQueryParameters = {
    query: "",
    starsThreshold: 2,
    forecastsThreshold: 0,
    forecastingPlatforms: platforms.map((platform) => platform.name),
    ...urlQuery,
  };

  let results: QuestionFragment[] = [];
  if (initialQueryParameters.query !== "") {
    const response = await client
      .query(SearchDocument, {
        input: {
          ...initialQueryParameters,
          limit: 1,
        },
      })
      .toPromise();
    if (response.data?.result) {
      results = response.data.result;
    } else {
      throw new Error("GraphQL request failed");
    }
  }

  return {
    props: {
      urqlState: ssrCache.extractData(),
      results,
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
              <QuestionCard
                question={result}
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
