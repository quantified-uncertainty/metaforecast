import {
    addDays, differenceInDays, format, startOfDay, startOfToday, startOfTomorrow
} from "date-fns";
import React from "react";
import {
    VictoryAxis, VictoryChart, VictoryGroup, VictoryLabel, VictoryLegend, VictoryLine,
    VictoryScatter, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer
} from "victory";

import { QuestionWithHistoryFragment } from "../../fragments.generated";

interface Props {
  question: QuestionWithHistoryFragment;
}

const formatOptionName = (name: string) => {
  return name.length > 20 ? name.slice(0, 17) + "..." : name;
};

const getLength = (str: string): number => {
  // TODO - measure with temporary DOM element instead?
  const capitalLetterLengthMultiplier = 1.25;
  const smallLetterMultiplier = 0.8;
  const numUpper = (str.match(/[A-Z]/g) || []).length;
  const numSmallLetters = (str.match(/[fijlrt]/g) || []).length;
  const numSpaces = (str.match(/[\s]/g) || []).length;
  const length =
    str.length +
    -numUpper -
    numSmallLetters +
    numUpper * capitalLetterLengthMultiplier +
    (numSmallLetters + numSpaces) * smallLetterMultiplier;
  return length;
};

type DataSet = { x: Date; y: number; name: string }[];

const colors = ["dodgerblue", "crimson", "seagreen", "darkviolet", "turquoise"];

// can't be replaced with React component, VictoryChart requires VictoryGroup elements to be immediate children
const getVictoryGroup = ({ data, i }: { data: DataSet; i: number }) => {
  return (
    <VictoryGroup color={colors[i] || "darkgray"} data={data} key={i}>
      <VictoryScatter
        name={`scatter-${i}`}
        size={({ active }) => (active ? 3.75 : 3)}
      />

      <VictoryLine name={`line-${i}`} />
    </VictoryGroup>
  );
};

export const HistoryChart: React.FC<Props> = ({ question }) => {
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
  let longestNameLength = 0;

  const sortedHistory = question.history.sort((a, b) =>
    a.timestamp < b.timestamp ? -1 : 1
  );

  for (const name of dataSetsNames) {
    let newDataset: DataSet = [];
    let previousDate = -Infinity;
    for (let item of sortedHistory) {
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
        let length = getLength(formatOptionName(relevantItem.name));
        longestNameLength =
          length > longestNameLength ? length : longestNameLength;
        newDataset.push(result);
        previousDate = item.timestamp;
      }
    }
    dataSets.push(newDataset);
  }

  const letterLength = 7;
  const labelLegendStart = 45;

  const domainMax =
    maxProbability < 0.5 ? Math.round(10 * (maxProbability + 0.05)) / 10 : 1;
  const dataSetsLength = dataSets.length;
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const width = 750;
  const height = width / goldenRatio;
  const padding = {
    top: 20,
    bottom: 60,
    left: 60,
    right: labelLegendStart + letterLength * longestNameLength,
  };

  const legendData = Array.from(Array(dataSetsLength).keys()).map((i) => ({
    name: formatOptionName(dataSetsNames[i]),
    symbol: { fill: colors[i] },
  }));

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
                      fontSize: 16,
                      fill: "black",
                      strokeWidth: 0.05,
                    },
                    {
                      fontSize: 16,
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
                fontSize: 16, // needs to be set here and not just in labelComponent for text size calculations
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
      <VictoryLegend
        x={width - labelLegendStart - letterLength * longestNameLength}
        y={height / 2 - 18 - (dataSetsLength - 1) * 13}
        orientation="vertical"
        gutter={20}
        style={{ border: { stroke: "white" }, labels: { fontSize: 15 } }}
        data={legendData}
      />

      {dataSets
        .slice(0, 5)
        .map((dataset, i) => getVictoryGroup({ data: dataset, i }))}
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
            style={{ fontSize: 15, fill: "#777" }}
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
          <VictoryLabel dy={0} style={{ fontSize: 15, fill: "#777" }} />
        }
        // tickFormat specifies how ticks should be displayed
        tickFormat={(x) => `${x * 100}%`}
      />
    </VictoryChart>
  );
};
