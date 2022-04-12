import { NextPage } from "next";
import React from "react";

import { displayQuestionsWrapperForSearch } from "../web/display/displayQuestionsWrappers";
import { Layout } from "../web/display/Layout";
import { Props } from "../web/search/anySearchPage";
import CommonDisplay from "../web/search/CommonDisplay";

export { getServerSideProps } from "../web/search/anySearchPage";

const IndexPage: NextPage<Props> = (props) => {
  return (
    <Layout page={"search"}>
      <CommonDisplay
        {...props}
        hasSearchbar={true}
        hasCapture={false}
        hasAdvancedOptions={true}
        placeholder={"Find forecasts about..."}
        displaySeeMoreHint={true}
        displayQuestionsWrapper={displayQuestionsWrapperForSearch}
      />
    </Layout>
  );
};

export default IndexPage;
