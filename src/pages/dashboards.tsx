/* Imports */
import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router"; // https://nextjs.org/docs/api-reference/next/router
import { useState } from "react";

import { DashboardItem } from "../backend/dashboards";
import { getPlatformsConfig, PlatformConfig } from "../backend/platforms";
import { DashboardCreator } from "../web/display/DashboardCreator";
import { DisplayForecasts } from "../web/display/DisplayForecasts";
import { Layout } from "../web/display/Layout";
import { addLabelsToForecasts, FrontendForecast } from "../web/platforms";
import { getDashboardForecastsByDashboardId } from "../web/worker/getDashboardForecasts";

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
const DashboardsPage: NextPage<Props> = ({
  initialDashboardForecasts,
  initialDashboardItem,
  platformsConfig,
}) => {
  const router = useRouter();
  const [dashboardForecasts, setDashboardForecasts] = useState(
    initialDashboardForecasts
  );
  const [dashboardItem, setDashboardItem] = useState(initialDashboardItem);

  const handleSubmit = async (data) => {
    console.log(data);
    // Send to server to create
    // Get back the id
    let response = await axios({
      url: "/api/create-dashboard-from-ids",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(data),
    }).then((res) => res.data);
    let dashboardId = response.dashboardId;
    if (!!dashboardId) {
      console.log("response: ", response);
      if (typeof window !== "undefined") {
        let urlWithoutDefaultParameters = `/dashboards?dashboardId=${dashboardId}`;
        if (!window.location.href.includes(urlWithoutDefaultParameters)) {
          window.history.replaceState(
            null,
            "Metaforecast",
            urlWithoutDefaultParameters
          );
        }
      }
      // router.push(`?dashboardId=${dashboardId}`)
      // display it

      let { dashboardForecasts, dashboardItem } =
        await getDashboardForecastsByDashboardId({
          dashboardId,
        });
      setDashboardForecasts(
        addLabelsToForecasts(dashboardForecasts, platformsConfig)
      );
      setDashboardItem(dashboardItem);
    }
  };

  let isGraubardEasterEgg = (name: string) =>
    name == "Clay Graubard" ? true : false;

  return (
    <Layout page="dashboard">
      {/* Display forecasts */}
      <div className="mt-7 mb-7">
        <h1
          className={
            !!dashboardItem && !!dashboardItem.title
              ? "text-4xl text-center text-gray-600 mt-2 mb-2"
              : "hidden"
          }
        >
          {!!dashboardItem ? dashboardItem.title : ""}
        </h1>
        <p
          className={
            !!dashboardItem &&
            !!dashboardItem.creator &&
            !isGraubardEasterEgg(dashboardItem.creator)
              ? "text-lg text-center text-gray-600 mt-2 mb-2"
              : "hidden"
          }
        >
          {!!dashboardItem ? `Created by: ${dashboardItem.creator}` : ""}
        </p>
        <p
          className={
            !!dashboardItem &&
            !!dashboardItem.creator &&
            isGraubardEasterEgg(dashboardItem.creator)
              ? "text-lg text-center text-gray-600 mt-2 mb-2"
              : "hidden"
          }
        >
          {!!dashboardItem ? `Created by: @` : ""}
          <a
            href={"https://twitter.com/ClayGraubard"}
            className="text-blue-600"
          >
            Clay Graubard
          </a>
        </p>
        <p
          className={
            !!dashboardItem && !!dashboardItem.description
              ? "text-lg text-center text-gray-600 mt-2 mb-2"
              : "hidden"
          }
        >
          {!!dashboardItem ? `${dashboardItem.description}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <DisplayForecasts
          results={dashboardForecasts}
          numDisplay={dashboardForecasts.length}
          showIdToggle={false}
        />
      </div>
      {/*  */}
      <h3 className="flex items-center col-start-2 col-end-2 w-full justify-center mt-8 mb-4">
        <span
          aria-hidden="true"
          className="flex-grow bg-gray-300 rounded h-0.5"
        ></span>
        <span
          className={
            !!dashboardForecasts && dashboardForecasts.length > 0
              ? `mx-3 text-md font-medium text-center`
              : "hidden"
          }
        >
          Or create your own
        </span>
        <span
          className={
            !dashboardForecasts || dashboardForecasts.length == 0
              ? `mx-3 text-md font-medium text-center`
              : "hidden"
          }
        >
          Create a dashboard!
        </span>
        <span
          aria-hidden="true"
          className="flex-grow bg-gray-300 rounded h-0.5"
        ></span>
      </h3>

      <div className="grid grid-cols-3 justify-center">
        <div className="flex col-start-2 col-end-2 items-center justify-center">
          <DashboardCreator handleSubmit={handleSubmit} />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardsPage;
