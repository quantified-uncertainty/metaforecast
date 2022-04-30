import { format } from "date-fns";
import React from "react";
import {
    VictoryAxis, VictoryChart, VictoryGroup, VictoryLabel, VictoryLegend, VictoryLine,
    VictoryScatter, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer
} from "victory";

import { QuestionWithHistoryFragment } from "../../fragments.generated";

interface Props {
  question: QuestionWithHistoryFragment;
}

let formatOptionName = (name: string) => {
  return name.length > 20 ? name.slice(0, 17) + "..." : name;
};

let getLength = (str: string): number => {
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

type DataSet = { date: Date; probability: number; name: string }[];

const dataAsXy = (data: DataSet) =>
  data.map((datum) => ({
    x: format(datum.date, "yyyy-MM-dd"),
    y: datum.probability,
    name: datum.name,
  }));

const colors = ["dodgerblue", "crimson", "seagreen", "darkviolet", "turquoise"];
// can't be replaced with React component, VictoryChar requires VictoryGroup elements to be immediate children
const getVictoryGroup = ({ data, i }: { data: DataSet; i: number }) => {
  return (
    <VictoryGroup color={colors[i] || "darkgray"} data={dataAsXy(data)} key={i}>
      <VictoryScatter
        name={`scatter-${i}`}
        size={({ active }) => (active ? 3.75 : 3)}
      />

      <VictoryLine name={`line-${i}`} />
    </VictoryGroup>
  );
};

export const HistoryChart: React.FC<Props> = ({ question }) => {
  let dataSetsNames: string[] = [];
  question.history.forEach((item) => {
    let optionNames = item.options.map((option) => option.name);
    dataSetsNames.push(...optionNames);
  });
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

  for (const name of dataSetsNames) {
    let newDataset: DataSet = [];
    let previousDate = -Infinity;
    for (let item of question.history) {
      const relevantItemsArray = item.options.filter((x) => x.name === name);
      const date = new Date(item.timestamp * 1000);
      if (
        relevantItemsArray.length == 1 &&
        item.timestamp - previousDate > 12 * 60 * 60
      ) {
        let relevantItem = relevantItemsArray[0];
        let result = {
          date,
          probability: relevantItem.probability,
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
    bottom: 50,
    left: 60,
    right: labelLegendStart + letterLength * longestNameLength,
  };

  const legendData = Array.from(Array(dataSetsLength).keys()).map((i) => ({
    name: formatOptionName(dataSetsNames[i]),
    symbol: { fill: colors[i] },
  }));

  return (
    <VictoryChart
      domainPadding={20}
      padding={padding}
      theme={VictoryTheme.material}
      height={height}
      width={width}
      containerComponent={
        <VictoryVoronoiContainer
          labels={({ datum }) => `Not shown`}
          labelComponent={
            <VictoryTooltip
              constrainToVisibleArea
              pointerLength={0}
              dy={-12}
              text={({ datum }) =>
                `${datum.name}: ${Math.round(datum.y * 100)}%`
              }
              style={{
                fontSize: 15,
                fill: "black",
                strokeWidth: 0.05,
              }}
              flyoutStyle={{
                stroke: "black",
                fill: "white",
              }}
              cornerRadius={0}
              flyoutPadding={7}
            />
          }
          voronoiBlacklist={
            ["line-0", "line-1", "line-2", "line-3", "line-4"]
            //Array.from(Array(5).keys()).map((x, i) => `line${i}`)
            // see: https://github.com/FormidableLabs/victory/issues/545
          }
        />
      }
      domain={{
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
        // tickValues specifies both the number of ticks and where
        // they are placed on the axis
        // tickValues={dataAsXy.map((datum) => datum.x)}
        // tickFormat={dataAsXy.map((datum) => datum.x)}
        tickCount={7}
        style={{
          grid: { stroke: null, strokeWidth: 0.5 },
        }}
        //axisLabelComponent={
        //  <VictoryLabel dy={40} style={{ fontSize: 10, fill: "gray" }} />
        //}
        tickLabelComponent={
          <VictoryLabel
            dy={10}
            angle={-30}
            style={{ fontSize: 15, fill: "gray" }}
          />
        }
      />
      <VictoryAxis
        dependentAxis
        // tickFormat specifies how ticks should be displayed
        tickFormat={(x) => `${x * 100}%`}
        style={{
          grid: { stroke: "#D3D3D3", strokeWidth: 0.5 },
        }}
        tickLabelComponent={
          <VictoryLabel dy={0} style={{ fontSize: 15, fill: "gray" }} />
        }
      />
    </VictoryChart>
  );
};
