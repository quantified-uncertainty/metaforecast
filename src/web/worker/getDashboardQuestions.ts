import axios from "axios";

import { DashboardItem } from "../../backend/dashboards";
import { getPlatformsConfig, Question } from "../../backend/platforms";
import { addLabelsToQuestions, FrontendQuestion } from "../platforms";

export async function getDashboardQuestionsByDashboardId({
  dashboardId,
  basePath,
}: {
  dashboardId: string;
  basePath?: string;
}): Promise<{
  dashboardQuestions: FrontendQuestion[];
  dashboardItem: DashboardItem;
}> {
  console.log("getDashboardQuestionsByDashboardId: ");
  if (typeof window === undefined && !basePath) {
    throw new Error("`basePath` option is required on server side");
  }

  let dashboardQuestions: Question[] = [];
  let dashboardItem: DashboardItem | null = null;
  try {
    let { data } = await axios({
      url: `${basePath || ""}/api/dashboard-by-id`,
      method: "post",
      data: {
        id: dashboardId,
      },
    });
    console.log(data);

    dashboardQuestions = data.dashboardContents;
    dashboardItem = data.dashboardItem as DashboardItem;
  } catch (error) {
    console.log(error);
  } finally {
    const labeledDashboardQuestions = addLabelsToQuestions(
      dashboardQuestions,
      getPlatformsConfig({ withGuesstimate: false })
    );

    return {
      dashboardQuestions: labeledDashboardQuestions,
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
