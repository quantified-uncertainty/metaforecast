import { GetServerSideProps, NextPage } from "next";
import Error from "next/error";
import Link from "next/link";

import { DashboardItem } from "../../../backend/dashboards";
import { DisplayForecasts } from "../../../web/display/DisplayForecasts";
import { InfoBox } from "../../../web/display/InfoBox";
import { Layout } from "../../../web/display/Layout";
import { LineHeader } from "../../../web/display/LineHeader";
import { FrontendForecast } from "../../../web/platforms";
import { reqToBasePath } from "../../../web/utils";
import { getDashboardForecastsByDashboardId } from "../../../web/worker/getDashboardForecasts";

interface Props {
  dashboardForecasts: FrontendForecast[];
  dashboardItem: DashboardItem;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const dashboardId = context.query.id as string;

  const { dashboardForecasts, dashboardItem } =
    await getDashboardForecastsByDashboardId({
      dashboardId,
      basePath: reqToBasePath(context.req), // required on server side to find the API endpoint
    });

  if (!dashboardItem) {
    context.res.statusCode = 404;
  }

  return {
    props: {
      dashboardForecasts,
      dashboardItem,
    },
  };
};

const DashboardMetadata: React.FC<{ dashboardItem: DashboardItem }> = ({
  dashboardItem,
}) => (
  <div>
    {dashboardItem?.title ? (
      <h1 className="text-4xl text-center text-gray-600 mt-2 mb-2">
        {dashboardItem.title}
      </h1>
    ) : null}

    {dashboardItem && dashboardItem.creator ? (
      <p className="text-lg text-center text-gray-600 mt-2 mb-2">
        Created by:{" "}
        {dashboardItem.creator === "Clay Graubard" ? (
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
          dashboardItem.creator
        )}
      </p>
    ) : null}

    {dashboardItem?.description ? (
      <p className="text-lg text-center text-gray-600 mt-2 mb-2">
        {dashboardItem.description}
      </p>
    ) : null}
  </div>
);

/* Body */
const ViewDashboardPage: NextPage<Props> = ({
  dashboardForecasts,
  dashboardItem,
}) => {
  return (
    <Layout page="view-dashboard">
      <div className="flex flex-col my-8 space-y-8">
        {dashboardItem ? (
          <DashboardMetadata dashboardItem={dashboardItem} />
        ) : (
          <Error statusCode={404} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DisplayForecasts
            results={dashboardForecasts}
            numDisplay={dashboardForecasts.length}
            showIdToggle={false}
          />
        </div>

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
