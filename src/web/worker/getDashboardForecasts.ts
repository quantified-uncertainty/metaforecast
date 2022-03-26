import axios from 'axios';

export async function getDashboardForecastsByDashboardId({ dashboardId }) {
  console.log("getDashboardForecastsByDashboardId: ");
  let dashboardForecastCompatibleWithFuse = [];
  let dashboardItem = null;
  try {
    let { data } = await axios({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard-by-id`,
      method: "post",
      data: {
        id: dashboardId,
      },
    });
    console.log(data);
    let dashboardContents = data.dashboardContents;
    dashboardItem = data.dashboardItem;
    // let { dashboardContents, dashboardItem } = data
    if (!!dashboardContents && !!dashboardContents.map) {
      dashboardForecastCompatibleWithFuse = dashboardContents.map((result) => ({
        item: result,
        score: 0,
      }));
    } else {
      console.log("Error in getDashboardForecastsByDashboardId");
    }
  } catch (error) {
    console.log(error);
  } finally {
    return {
      dashboardForecasts: dashboardForecastCompatibleWithFuse,
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
