import { Layout } from "../../web/common/Layout";
import { PlatformsStatusDocument } from "../../web/status/queries.generated";
import { getUrqlRscClient } from "../../web/urql";

export default async function () {
  const client = getUrqlRscClient();

  const data =
    (await client.query(PlatformsStatusDocument, {})).data?.result || null;

  if (!data) {
    throw new Error("No data");
  }

  return (
    <Layout page="status">
      <table className="table-auto border-collapse border border-gray-200 bg-white mx-auto mb-10">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-200 p-4">Platform</th>
            <th className="border border-gray-200 p-4">Last updated</th>
          </tr>
        </thead>
        <tbody>
          {data.map((platform) => {
            const ts = platform.lastUpdated
              ? new Date(platform.lastUpdated * 1000)
              : null;
            const isStale =
              !ts || new Date().getTime() - ts.getTime() > 2 * 86400 * 1000;
            return (
              <tr key={platform.id}>
                <td
                  className={`border border-gray-200 p-4 ${
                    isStale ? "bg-red-300" : ""
                  }`}
                >
                  {platform.label}
                </td>
                <td className="border border-gray-200 p-4">
                  <div className="text-sm">{ts ? String(ts) : null}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Layout>
  );
}
