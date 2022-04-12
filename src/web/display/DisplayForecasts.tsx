import React from "react";

import { FrontendForecast } from "../platforms";
import { DisplayForecast } from "./DisplayForecast";

interface Props {
  results: FrontendForecast[];
  numDisplay: number;
  showIdToggle: boolean;
}

export const DisplayForecasts: React.FC<Props> = ({
  results,
  numDisplay,
  showIdToggle,
}) => {
  if (!results) {
    return <></>;
  }
  return (
    <>
      {results.slice(0, numDisplay).map((result) => (
        /*let displayWithMetaculusCapture =
          fuseSearchResult.item.platform == "Metaculus"
            ? metaculusEmbed(fuseSearchResult.item)
            : displayForecast({ ...fuseSearchResult.item });
        */
        <DisplayForecast
          key={result.id}
          forecast={result}
          showTimeStamp={false}
          expandFooterToFullWidth={false}
          showIdToggle={showIdToggle}
        />
      ))}
    </>
  );
};
