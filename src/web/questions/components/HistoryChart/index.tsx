import dynamic from "next/dynamic";
import React, { useMemo, useState } from "react";

import { QuestionWithHistoryFragment } from "../../../fragments.generated";
import { InnerChartPlaceholder } from "./InnerChartPlaceholder";
import { buildChartData, chartColors } from "./utils";

const InnerChart = dynamic(
  () => import("./InnerChart").then((mod) => mod.InnerChart),
  { ssr: false, loading: () => <InnerChartPlaceholder /> }
);

interface Props {
  question: QuestionWithHistoryFragment;
}

const Legend: React.FC<{
  items: { name: string; color: string }[];
  setHighlight: (i: number | undefined) => void;
}> = ({ items, setHighlight }) => {
  return (
    <div className="space-y-2" onMouseLeave={() => setHighlight(undefined)}>
      {items.map((item, i) => (
        <div
          className="flex items-center"
          key={item.name}
          onMouseOver={() => setHighlight(i)}
        >
          <svg className="mt-1 shrink-0" height="10" width="16">
            <circle cx="4" cy="4" r="4" fill={item.color} />
          </svg>
          <span className="text-xs sm:text-sm sm:whitespace-nowrap sm:text-ellipsis sm:overflow-hidden sm:max-w-160">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
};

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
