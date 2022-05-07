import React from "react";

import { QuestionFragment } from "../../fragments.generated";
import { QuestionCard } from "./QuestionCard";

interface Props {
  results: QuestionFragment[];
  numDisplay: number;
  showIdToggle: boolean;
}

export const QuestionCardsList: React.FC<Props> = ({
  results,
  numDisplay,
  showIdToggle,
}) => {
  if (!results) {
    return null;
  }
  return (
    <>
      {results.slice(0, numDisplay).map((result) => (
        <QuestionCard
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
