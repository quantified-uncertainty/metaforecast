import { GetServerSideProps, NextPage } from "next";
import Error from "next/error";
import Link from "next/link";

import { InfoBox } from "../../../web/common/InfoBox";
import { Layout } from "../../../web/common/Layout";
import { LineHeader } from "../../../web/common/LineHeader";
import {
    DashboardByIdDocument, DashboardFragment
} from "../../../web/dashboards/queries.generated";
import { QuestionCardsList } from "../../../web/questions/components/QuestionCardsList";
import { ssrUrql } from "../../../web/urql";

interface Props {
  dashboard?: DashboardFragment;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const [ssrCache, client] = ssrUrql();
  const dashboardId = context.query.id as string;

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
    },
  };
};

const DashboardMetadata: React.FC<{ dashboard: DashboardFragment }> = ({
  dashboard,
}) => (
  <div>
    {dashboard.title ? (
      <h1 className="text-4xl text-center text-gray-600 mt-2 mb-2">
        {dashboard.title}
      </h1>
    ) : null}

    {dashboard.creator ? (
      <p className="text-lg text-center text-gray-600 mt-2 mb-2">
        Created by:{" "}
        {dashboard.creator === "Clay Graubard" ? (
          <>
            @
            <a
              href="https://twitter.com/ClayGraubard"
              className="text-blue-600"
            >
              Clay Graubard
            </a>
          </>
        ) : (
          dashboard.creator
        )}
      </p>
    ) : null}

    {dashboard.description ? (
      <p className="text-lg text-center text-gray-600 mt-2 mb-2">
        {dashboard.description}
      </p>
    ) : null}
  </div>
);

/* Body */
const ViewDashboardPage: NextPage<Props> = ({ dashboard }) => {
  return (
    <Layout page="view-dashboard">
      <div className="flex flex-col my-8 space-y-8">
        {dashboard ? (
          <>
            <DashboardMetadata dashboard={dashboard} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <QuestionCardsList
                results={dashboard.questions}
                numDisplay={dashboard.questions.length}
                showIdToggle={false}
              />
            </div>
          </>
        ) : (
          <Error statusCode={404} />
        )}

        <div className="max-w-xl self-center">
          <InfoBox>
            Dashboards cannot be changed after they are created.
          </InfoBox>
        </div>

        <LineHeader>
          <Link href="/dashboards" passHref>
            <a>Create your own dashboard</a>
          </Link>
        </LineHeader>
      </div>
    </Layout>
  );
};

export default ViewDashboardPage;
