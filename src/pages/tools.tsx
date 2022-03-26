import Link from 'next/link';
import React from 'react';

import Layout from './layout';

/* Display one tool */
function displayTool({
  sameWebpage,
  title,
  description,
  link,
  url,
  img,
  i,
}: any) {
  switch (sameWebpage) {
    case true:
      return (
        <Link href={link} passHref key={`tool-${i}`}>
          <div className="hover:bg-gray-100 hover:no-underline cursor-pointer flex flex-col px-4 py-3 bg-white rounded-md shadow place-content-stretch flex-grow no-underline b-6">
            <div className="flex-grow items-stretch">
              <div className={`text-gray-800 text-lg mb-2 font-medium `}>
                {title}
              </div>
              <div className={`text-gray-500 mb-3 `}>{description}</div>
              {}
              <img src={img} className={`text-gray-500 mb-2`} />
            </div>
          </div>
        </Link>
      );
      break;
    default:
      return (
        <a
          href={url}
          key={`tool-${i}`}
          className="hover:bg-gray-100 hover:no-underline cursor-pointer flex flex-col px-4 py-3 bg-white rounded-md shadow place-content-stretch flex-grow no-underline b-6"
        >
          <div className="flex-grow items-stretch">
            <div className={`text-gray-800 text-lg mb-2 font-medium `}>
              {title}
            </div>
            <div className={`text-gray-500 mb-3 `}>{description}</div>
            {}
            <img src={img} className={`text-gray-500 mb-2`} />
          </div>
        </a>
      );
      break;
  }
}

export default function Tools({ lastUpdated }) {
  let tools = [
    {
      title: "Search",
      description: "Find forecasting questions on many platforms",
      link: "/",
      sameWebpage: true,
      img: "https://i.imgur.com/Q94gVqG.png",
    },
    {
      title: "[Beta] Present",
      description: "Present forecasts in dashboards.",
      sameWebpage: true,
      link: "/dashboards",
      img: "https://i.imgur.com/x8qkuHQ.png",
    },
    {
      title: "Capture",
      description:
        "Capture forecasts save them to Imgur. Useful for posting them somewhere else as images. Currently rate limited by Imgur, so if you get a .gif of a fox falling flat on his face, that's why.",
      link: "/capture",
      sameWebpage: true,
      img: "https://i.imgur.com/EXkFBzz.png",
    },
    {
      title: "Summon",
      description:
        "Summon metaforecast on Twitter by mentioning @metaforecast, or on Discord by using Fletcher and !metaforecast, followed by search terms",
      url: "https://twitter.com/metaforecast",
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
        {tools.map((tool, i) => displayTool({ ...tool, i }))}
      </div>
    </Layout>
  );
}
