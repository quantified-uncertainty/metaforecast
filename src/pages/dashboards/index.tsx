import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router"; // https://nextjs.org/docs/api-reference/next/router

import { DashboardItem } from "../../backend/dashboards";
import { getPlatformsConfig, PlatformConfig } from "../../backend/platforms";
import { DashboardCreator } from "../../web/display/DashboardCreator";
import { Layout } from "../../web/display/Layout";
import { LineHeader } from "../../web/display/LineHeader";
import { addLabelsToForecasts, FrontendForecast } from "../../web/platforms";
import { getDashboardForecastsByDashboardId } from "../../web/worker/getDashboardForecasts";

interface Props {
  initialDashboardForecasts: FrontendForecast[];
  initialDashboardId: string | null;
  initialDashboardItem: DashboardItem | null;
  platformsConfig: PlatformConfig[];
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const dashboardIdQ = context.query.dashboardId;
  const dashboardId: string | undefined =
    typeof dashboardIdQ === "object" ? dashboardIdQ[0] : dashboardIdQ;

  const platformsConfig = getPlatformsConfig({ withGuesstimate: false });

  if (!dashboardId) {
    return {
      props: {
        platformsConfig,
        initialDashboardForecasts: [],
        initialDashboardId: null,
        initialDashboardItem: null,
      },
    };
  }

  const { dashboardForecasts, dashboardItem } =
    await getDashboardForecastsByDashboardId({
      dashboardId,
    });
  const frontendDashboardForecasts = addLabelsToForecasts(
    dashboardForecasts,
    platformsConfig
  );

  return {
    props: {
      initialDashboardForecasts: frontendDashboardForecasts,
      initialDashboardId: dashboardId,
      initialDashboardItem: dashboardItem,
      platformsConfig,
    },
  };
};

/* Body */
const DashboardsPage: NextPage<Props> = () => {
  const router = useRouter();

  const handleSubmit = async (data) => {
    // Send to server to create
    // Get back the id
    let response = await axios({
      url: "/api/create-dashboard-from-ids",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(data),
    }).then((res) => res.data);
    await router.push(`/dashboards/view/${response.dashboardId}`);
  };

  return (
    <Layout page="dashboard">
      <div className="flex flex-col my-8 space-y-8">
        <LineHeader>Create a dashboard!</LineHeader>

        <div className="self-center">
          <DashboardCreator handleSubmit={handleSubmit} />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardsPage;
