import { NextPage } from "next";
import Link from "next/link";
import React from "react";

import { Card } from "../web/display/Card";
import { Layout } from "../web/display/Layout";

type AnyTool = {
  title: string;
  description: string;
  img?: string;
};

type InnerTool = AnyTool & { innerLink: string };
type ExternalTool = AnyTool & { externalLink: string };
type UpcomingTool = AnyTool;

type Tool = InnerTool | ExternalTool | UpcomingTool;

/* Display one tool */
const ToolCard: React.FC<Tool> = (tool) => {
  const inner = (
    <Card>
      <div className="grid content-start gap-3">
        <div className="text-gray-800 text-lg font-medium">{tool.title}</div>
        <div className="text-gray-500">{tool.description}</div>
        {tool.img && <img src={tool.img} className="text-gray-500" />}
      </div>
    </Card>
  );

  if ("innerLink" in tool) {
    return (
      <Link href={tool.innerLink} passHref>
        <a className="text‑inherit no-underline">{inner}</a>
      </Link>
    );
  } else if ("externalLink" in tool) {
    return (
      <a href={tool.externalLink} className="text‑inherit no-underline">
        {inner}
      </a>
    );
  } else {
    return inner;
  }
};

const ToolsPage: NextPage = () => {
  let tools: Tool[] = [
    {
      title: "Search",
      description: "Find forecasting questions on many platforms.",
      innerLink: "/",
      img: "https://i.imgur.com/Q94gVqG.png",
    },
    {
      title: "[Beta] Present",
      description: "Present forecasts in dashboards.",
      innerLink: "/dashboards",
      img: "https://i.imgur.com/x8qkuHQ.png",
    },
    {
      title: "Capture",
      description:
        "Capture forecasts save them to Imgur. Useful for posting them somewhere else as images. Currently rate limited by Imgur, so if you get a .gif of a fox falling flat on his face, that's why.",
      innerLink: "/capture",
      img: "https://i.imgur.com/EXkFBzz.png",
    },
    {
      title: "Summon",
      description:
        "Summon metaforecast on Twitter by mentioning @metaforecast, or on Discord by using Fletcher and !metaforecast, followed by search terms.",
      externalLink: "https://twitter.com/metaforecast",
      img: "https://i.imgur.com/BQ4Zzjw.png",
    },
    {
      title: "[Upcoming] Request",
      description:
        "Interact with metaforecast's API and fetch forecasts for your application. Currently possible but documentation is poor, get in touch.",
    },
    {
      title: "[Upcoming] Record",
      description: "Save your forecasts or bets.",
    },
  ];
  return (
    <Layout page="tools">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8 place-content-stretch">
        {tools.map((tool, i) => (
          <ToolCard {...tool} key={i} />
        ))}
      </div>
    </Layout>
  );
};

export default ToolsPage;
