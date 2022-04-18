import axios from "axios";

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
