import { GetServerSideProps, NextPage } from "next";
import Error from "next/error";

import {
    DashboardByIdDocument, DashboardFragment
} from "../../../web/dashboards/queries.generated";
import { DisplayQuestions } from "../../../web/display/DisplayQuestions";
import { ssrUrql } from "../../../web/urql";

interface Props {
  dashboard?: DashboardFragment;
  numCols?: number;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const [ssrCache, client] = ssrUrql();
  const dashboardId = context.query.id as string;
  const numCols = Number(context.query.numCols);

  const dashboard = (
    await client.query(DashboardByIdDocument, { id: dashboardId }).toPromise()
  ).data?.result;

  if (!dashboard) {
    context.res.statusCode = 404;
  }

  return {
    props: {
      // reduntant: page component doesn't do graphql requests, but it's still nice/more consistent to have data in cache
      urqlState: ssrCache.extractData(),
      dashboard,
      numCols: !numCols ? null : numCols < 5 ? numCols : 4,
    },
  };
};

const EmbedDashboardPage: NextPage<Props> = ({ dashboard, numCols }) => {
  if (!dashboard) {
    return <Error statusCode={404} />;
  }

  return (
    <div className="mb-4 mt-3 flex flex-row justify-left items-center">
      <div className="mx-2 place-self-left">
        <div
          className={`grid grid-cols-${numCols || 1} sm:grid-cols-${
            numCols || 1
          } md:grid-cols-${numCols || 2} lg:grid-cols-${
            numCols || 3
          } gap-4 mb-6`}
        >
          <DisplayQuestions
            results={dashboard.questions}
            numDisplay={dashboard.questions.length}
            showIdToggle={false}
          />
        </div>
      </div>
    </div>
  );
};

export default EmbedDashboardPage;
