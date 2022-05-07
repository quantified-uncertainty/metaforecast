import dynamic from "next/dynamic";
import React, { useMemo, useState } from "react";

import { QuestionWithHistoryFragment } from "../../../fragments.generated";
import { InnerChartPlaceholder } from "./InnerChartPlaceholder";
import { Legend } from "./Legend";
import { buildChartData, chartColors } from "./utils";

const InnerChart = dynamic(
  () => import("./InnerChart").then((mod) => mod.InnerChart),
  { ssr: false, loading: () => <InnerChartPlaceholder /> }
);

interface Props {
  question: QuestionWithHistoryFragment;
}

export const HistoryChart: React.FC<Props> = ({ question }) => {
  // maybe use context instead?
  const [highlight, setHighlight] = useState<number | undefined>(undefined);

  const data = useMemo(() => buildChartData(question), [question]);

  return (
    <div className="flex items-center flex-col sm:flex-row">
      <InnerChart data={data} highlight={highlight} />
      <Legend
        items={data.seriesNames.map((name, i) => ({
          name,
          color: chartColors[i],
        }))}
        setHighlight={setHighlight}
      />
    </div>
  );
};
