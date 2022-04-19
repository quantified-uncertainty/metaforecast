import axios from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { DashboardCreator } from "../../web/display/DashboardCreator";
import { InfoBox } from "../../web/display/InfoBox";

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
        <LineHeader>Charts!</LineHeader>

        <div className="self-center">{""}</div>
        <div className="max-w-2xl self-center">
          <InfoBox>
            This is an under-construction endpoint to display charts. Go to
            metaforecast.org/charts/view/[id] to find the chart for a particular
            question.
          </InfoBox>
        </div>
        <div className="max-w-2xl self-center">
          <InfoBox>
            You can find the necessary ids by toggling the advanced options in
            the search, or by visiting{" "}
            <a href="/api/all-forecasts">/api/all-forecasts</a>
          </InfoBox>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardsPage;
