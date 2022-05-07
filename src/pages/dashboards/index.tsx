import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMutation } from "urql";

import { Layout } from "../../web/common/Layout";
import { LineHeader } from "../../web/common/LineHeader";
import { CreateDashboardDocument } from "../../web/dashboards/queries.generated";
import { DashboardCreator } from "../../web/display/DashboardCreator";

const DashboardsPage: NextPage = () => {
  const router = useRouter();
  const [createDashboardResult, createDashboard] = useMutation(
    CreateDashboardDocument
  );

  const handleSubmit = async (data: any) => {
    const result = await createDashboard({
      input: {
        title: data.title,
        description: data.description,
        creator: data.creator,
        ids: data.ids,
      },
    });
    const dashboardId = result?.data?.result?.dashboard?.id;
    if (!dashboardId) {
      throw new Error("Couldn't create a dashboard"); // TODO - toaster
    }
    await router.push(`/dashboards/view/${dashboardId}`);
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
