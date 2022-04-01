import { NextApiRequest, NextApiResponse } from "next/types";

import { pgGetByIds } from "../../backend/database/pg-wrapper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(400).send("Expected POST request");
    return;
  }

  console.log(req.body);
  let id = req.body.id;
  console.log(id);
  let dashboardItemArray = await pgGetByIds({
    ids: [id],
    table: "dashboards",
  });
  if (!!dashboardItemArray && dashboardItemArray.length > 0) {
    let dashboardItem = dashboardItemArray[0];
    console.log(dashboardItem);
    let dashboardContents = await pgGetByIds({
      ids: dashboardItem.contents,
      table: "questions",
    });
    res.status(200).send({
      dashboardContents,
      dashboardItem,
    });
  } else {
    res.status(404).send({ error: `Dashboard not found with id ${id}` });
  }
}
