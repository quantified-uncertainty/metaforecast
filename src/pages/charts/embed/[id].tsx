import { GetServerSideProps, NextPage } from "next";
import Error from "next/error";

import { DashboardItem } from "../../../backend/dashboards";
import { DisplayForecasts } from "../../../web/display/DisplayForecasts";
import { FrontendForecast } from "../../../web/platforms";
import { getDashboardForecastsByDashboardId } from "../../../web/worker/getDashboardForecasts";
import { reqToBasePath } from "../../../web/utils";

interface Props {
  dashboardForecasts: FrontendForecast[];
  dashboardItem: DashboardItem;
  numCols?: number;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const dashboardId = context.query.id as string;
  const numCols = Number(context.query.numCols);

  const { dashboardItem, dashboardForecasts } =
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
      numCols: !numCols ? null : numCols < 5 ? numCols : 4,
    },
  };
};

const EmbedDashboardPage: NextPage<Props> = ({
  dashboardForecasts,
  dashboardItem,
  numCols,
}) => {
  if (!dashboardItem) {
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
          <DisplayForecasts
            results={dashboardForecasts}
            numDisplay={dashboardForecasts.length}
            showIdToggle={false}
          />
        </div>
      </div>
    </div>
  );
};

export default EmbedDashboardPage;
