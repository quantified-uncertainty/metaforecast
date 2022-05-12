import { NextApiRequest, NextApiResponse } from "next/types";

import { run } from "@quri/squiggle-lang";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res
      .status(400)
      .send(
        "This is an endpoint for interacting with squiggle. Try sending a post request!"
      );
    return;
  }

  let body = req.body;
  if (!body || !body.model) {
    console.log("Request was incorrect");
    res.status(400).send({
      tag: "Error",
      value: `Incorrect request to server. Try sending a json which contains a "model" property, such as:
$ curl -X POST -H "Content-Type: application/json"     -d '{"model": "1 to 4"}'     https://metaforecast.org/api/squiggle `,
    });
  } else {
    console.log(body.model);
    res.status(200).send(run(body.model));
  }
}
