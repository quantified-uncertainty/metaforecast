import axios from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { DashboardCreator } from "../../web/display/DashboardCreator";
import { Layout } from "../../web/display/Layout";
import { LineHeader } from "../../web/display/LineHeader";

const DashboardsPage: NextPage = () => {
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
