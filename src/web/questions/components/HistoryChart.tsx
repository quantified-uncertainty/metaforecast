import {
    addDays, differenceInDays, format, startOfDay, startOfToday, startOfTomorrow
} from "date-fns";
import React, { useState } from "react";
import {
    VictoryAxis, VictoryChart, VictoryGroup, VictoryLabel, VictoryLine, VictoryScatter,
    VictoryTheme, VictoryTooltip, VictoryVoronoiContainer
} from "victory";

import { QuestionWithHistoryFragment } from "../../fragments.generated";

interface Props {
  question: QuestionWithHistoryFragment;
}

type DataSet = { x: Date; y: number; name: string }[];

const colors = ["dodgerblue", "crimson", "seagreen", "darkviolet", "turquoise"];

// can't be replaced with React component, VictoryChart requires VictoryGroup elements to be immediate children
const getVictoryGroup = ({
  data,
  i,
  highlight,
}: {
  data: DataSet;
  i: number;
  highlight?: boolean;
}) => {
  return (
    <VictoryGroup color={colors[i] || "darkgray"} data={data} key={i}>
      <VictoryScatter
        name={`scatter-${i}`}
        size={({ active }) => (active || highlight ? 3.75 : 3)}
      />

      <VictoryLine name={`line-${i}`} />
    </VictoryGroup>
  );
};

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
  const [highlight, setHighlight] = useState<number | undefined>(undefined);

  let dataSetsNames = question.options
    .sort((a, b) => (a.probability > b.probability ? -1 : 1))
    .map((o) => o.name);
  dataSetsNames = [...new Set(dataSetsNames)].slice(0, 5); // take the first 5

  const isBinary =
    (dataSetsNames[0] === "Yes" && dataSetsNames[1] === "No") ||
    (dataSetsNames[0] === "No" && dataSetsNames[1] === "Yes");
  if (isBinary) {
    dataSetsNames = ["Yes"];
  }

  let dataSets: DataSet[] = [];
  let maxProbability = 0;

  const sortedHistory = question.history.sort((a, b) =>
    a.timestamp < b.timestamp ? -1 : 1
  );

  for (const name of dataSetsNames) {
    let newDataset: DataSet = [];
    let previousDate = -Infinity;
    for (const item of sortedHistory) {
      const relevantItemsArray = item.options.filter((x) => x.name === name);
      const date = new Date(item.timestamp * 1000);
      if (
        relevantItemsArray.length === 1 &&
        item.timestamp - previousDate > 12 * 60 * 60
      ) {
        let relevantItem = relevantItemsArray[0];
        const result = {
          x: date,
          y: relevantItem.probability,
          name: relevantItem.name,
        };
        maxProbability =
          relevantItem.probability > maxProbability
            ? relevantItem.probability
            : maxProbability;
        newDataset.push(result);
        previousDate = item.timestamp;
      }
    }
    dataSets.push(newDataset);
  }

  const domainMax =
    maxProbability < 0.5 ? Math.round(10 * (maxProbability + 0.05)) / 10 : 1;
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const width = 750;
  const height = width / goldenRatio;
  const padding = {
    top: 20,
    bottom: 60,
    left: 60,
    right: 20,
  };

  const minDate = sortedHistory.length
    ? startOfDay(new Date(sortedHistory[0].timestamp * 1000))
    : startOfToday();
  const maxDate = sortedHistory.length
    ? addDays(
        startOfDay(
          new Date(sortedHistory[sortedHistory.length - 1].timestamp * 1000)
        ),
        1
      )
    : startOfTomorrow();

  return (
    <div className="flex items-center flex-col sm:flex-row">
      <VictoryChart
        domainPadding={20}
        padding={padding}
        theme={VictoryTheme.material}
        height={height}
        width={width}
        containerComponent={
          <VictoryVoronoiContainer
            labels={() => "Not shown"}
            labelComponent={
              <VictoryTooltip
                constrainToVisibleArea
                pointerLength={0}
                dy={-12}
                labelComponent={
                  <VictoryLabel
                    style={[
                      {
                        fontSize: 18,
                        fill: "black",
                        strokeWidth: 0.05,
                      },
                      {
                        fontSize: 18,
                        fill: "#777",
                        strokeWidth: 0.05,
                      },
                    ]}
                  />
                }
                text={({ datum }) =>
                  `${datum.name}: ${Math.round(datum.y * 100)}%\n${format(
                    datum.x,
                    "yyyy-MM-dd"
                  )}`
                }
                style={{
                  fontSize: 18, // needs to be set here and not just in labelComponent for text size calculations
                  fontFamily:
                    '"Gill Sans", "Gill Sans MT", "Ser­avek", "Trebuchet MS", sans-serif',
                  // default font family from Victory, need to be specified explicitly for some reason, otherwise text size gets miscalculated
                }}
                flyoutStyle={{
                  stroke: "#999",
                  fill: "white",
                }}
                cornerRadius={4}
                flyoutPadding={{ top: 4, bottom: 4, left: 12, right: 12 }}
              />
            }
            radius={50}
            voronoiBlacklist={
              [...Array(5).keys()].map((i) => `line-${i}`)
              // see: https://github.com/FormidableLabs/victory/issues/545
            }
          />
        }
        scale={{
          x: "time",
          y: "linear",
        }}
        domain={{
          x: [minDate, maxDate],
          y: [0, domainMax],
        }}
      >
        {dataSets.map((dataset, i) =>
          getVictoryGroup({ data: dataset, i, highlight: i === highlight })
        )}
        <VictoryAxis
          tickCount={Math.min(7, differenceInDays(maxDate, minDate) + 1)}
          style={{
            grid: { stroke: null, strokeWidth: 0.5 },
          }}
          tickLabelComponent={
            <VictoryLabel
              dx={-30}
              dy={-3}
              angle={-30}
              style={{ fontSize: 18, fill: "#777" }}
            />
          }
          scale={{ x: "time" }}
          tickFormat={(t) => format(t, "yyyy-MM-dd")}
        />
        <VictoryAxis
          dependentAxis
          style={{
            grid: { stroke: "#D3D3D3", strokeWidth: 0.5 },
          }}
          tickLabelComponent={
            <VictoryLabel dy={0} style={{ fontSize: 18, fill: "#777" }} />
          }
          // tickFormat specifies how ticks should be displayed
          tickFormat={(x) => `${x * 100}%`}
        />
      </VictoryChart>
      <Legend
        items={dataSetsNames.map((name, i) => ({ name, color: colors[i] }))}
        setHighlight={setHighlight}
      />
    </div>
  );
};
