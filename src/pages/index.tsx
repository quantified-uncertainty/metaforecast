import { NextPage } from "next";
import React from "react";

import { displayForecastsWrapperForSearch } from "../web/display/displayForecastsWrappers";
import Layout from "../web/display/layout";
import { Props } from "../web/search/anySearchPage";
import CommonDisplay from "../web/search/CommonDisplay";

export { getServerSideProps } from "../web/search/anySearchPage";

const IndexPage: NextPage<Props> = ({
  defaultResults,
  initialResults,
  initialQueryParameters,
}) => {
  return (
    <Layout page={"search"}>
      <CommonDisplay
        defaultResults={defaultResults}
        initialResults={initialResults}
        initialQueryParameters={initialQueryParameters}
        hasSearchbar={true}
        hasCapture={false}
        hasAdvancedOptions={true}
        placeholder={"Find forecasts about..."}
        displaySeeMoreHint={true}
        displayForecastsWrapper={displayForecastsWrapperForSearch}
      />
    </Layout>
  );
};

export default IndexPage;
