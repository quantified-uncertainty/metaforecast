import React from "react";

import { FrontendQuestion } from "../platforms";
import { DisplayQuestion } from "./DisplayQuestion";

interface Props {
  results: FrontendQuestion[];
  numDisplay: number;
  showIdToggle: boolean;
}

export const DisplayQuestions: React.FC<Props> = ({
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
        <DisplayQuestion
          key={result.id}
          question={result}
          showTimeStamp={false}
          expandFooterToFullWidth={false}
          showIdToggle={showIdToggle}
        />
      ))}
    </>
  );
};
