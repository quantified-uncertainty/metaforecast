import axios from "axios";

import { DashboardItem } from "../../backend/dashboards";
import { Forecast, getPlatformsConfig } from "../../backend/platforms";
import { addLabelsToForecasts, FrontendForecast } from "../platforms";

export async function getDashboardForecastsByDashboardId({
  dashboardId,
}): Promise<{
  dashboardForecasts: FrontendForecast[];
  dashboardItem: DashboardItem;
}> {
  console.log("getDashboardForecastsByDashboardId: ");
  let dashboardForecasts: Forecast[] = [];
  let dashboardItem: DashboardItem | null = null;
  try {
    const { data } = await axios({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard-by-id`,
      method: "post",
      data: {
        id: dashboardId,
      },
    });
    console.log(data);

    dashboardForecasts = data.dashboardContents;
    dashboardItem = data.dashboardItem as DashboardItem;
  } catch (error) {
    console.log(error);
  } finally {
    const labeledDashboardForecasts = addLabelsToForecasts(
      dashboardForecasts,
      getPlatformsConfig({ withGuesstimate: false })
    );

    return {
      dashboardForecasts: labeledDashboardForecasts,
      dashboardItem,
    };
  }
}

export async function createDashboard(payload) {
  let data = { dashboardId: null };
  try {
    let { title, description, ids, creator, extra } = payload;
    console.log(payload);
    let response = await axios({
      url: "/api/create-dashboard-from-ids",
      method: "post",
      data: {
        title: title || "",
        description: description || "",
        ids: ids,
        creator: creator || "",
        extra: [],
      },
    });
    data = response.data;
    console.log(data);
  } catch (error) {
    console.log(error);
  } finally {
    return data;
  }
}
