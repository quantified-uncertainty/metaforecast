import React from "react";
import {
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryLabel,
  VictoryLegend,
  VictoryScatter,
  VictoryLine,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";

import { QuestionWithHistoryFragment } from "../../fragments.generated";

interface Props {
  question: QuestionWithHistoryFragment;
}

const buildDataset = (n, fn) => {
  return Array.from(Array(n).keys()).map((x) => ({
    date: x,
    probability: fn(x),
  }));
};

let getDate0 = (x) => {
  // for fake data
  let date = new Date(x);
  return date.toISOString().slice(5, 10).replaceAll("-", "/");
};

let formatOptionName = (name) => {
  return name.length > 10 ? name.slice(0, 8) + "..." : name;
};

let getLength = (str) => {
  let capitalLetterLengthMultiplier = 1.25;
  let smallLetterMultiplier = 0.8;
  let numUpper = (str.match(/[A-Z]/g) || []).length;
  let numSmallLetters = (str.match(/[fijlrt]/g) || []).length;
  let numSpaces = (str.match(/[\s]/g) || []).length;
  let length =
    str.length +
    -numUpper -
    numSmallLetters +
    numUpper * capitalLetterLengthMultiplier +
    (numSmallLetters + numSpaces) * smallLetterMultiplier;
  return length;
};

let timestampToString = (x) => {
  // for real timestamps
  console.log(x);
  let date = new Date(Date.parse(x));
  let dayOfMonth = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let dateString = `${("0" + dayOfMonth).slice(-2)}/${("0" + month).slice(
    -2
  )}/${year.toString().slice(-2)}`;
  console.log(dateString);
  return dateString;
};

let dataAsXy = (data) =>
  data.map((datum) => ({
    x: timestampToString(datum.date), //getDate(datum.date * (1000 * 60 * 60 * 24)),
    y: datum.probability,
    name: datum.name,
  }));

const colors = ["dodgerblue", "crimson", "seagreen", "darkviolet", "turquoise"];
const getVictoryGroup = (data, i) => {
  return (
    <VictoryGroup color={colors[i] || "darkgray"} data={dataAsXy(data)}>
      <VictoryScatter
        name={`scatter-${i}`}
        //style={{ labels: { display: "none" } }}
        size={({ active }) => (active ? 3.75 : 3)}
        //labels={() => null}
        //labelComponent={<span></span>}
      />

      <VictoryLine
        name={`line-${i}`}
        //style={{ labels: { display: "none" } }}
        //labels={() => null}
        //labelComponent={<span></span>}
      />
    </VictoryGroup>
  );
};

export const HistoryChart: React.FC<Props> = ({ question }) => {
  let dataSetsNames = [];
  question.history.forEach((item) => {
    let optionNames = item.options.map((option) => option.name);
    dataSetsNames.push(...optionNames);
  });
  dataSetsNames = [...new Set(dataSetsNames)].slice(0, 5); // take the first 5
  let dataSets = [];
  let maxProbability = 0;
  let longestNameLength = 0;

  for (let name of dataSetsNames) {
    let newDataset = [];
    let previousDate = -Infinity;
    for (let item of question.history) {
      let relevantItemsArray = item.options.filter((x) => x.name == name);
      let date = new Date(item.timestamp * 1000);
      if (
        relevantItemsArray.length == 1 &&
        item.timestamp - previousDate > 12 * 60 * 60
      ) {
        let relevantItem = relevantItemsArray[0];
        // if (relevantItem.type == "PROBABILITY") {
        let result = {
          date,
          probability: relevantItem.probability,
          name: relevantItem.name,
        };
        maxProbability =
          relevantItem.probability > maxProbability
            ? relevantItem.probability
            : maxProbability;
        let length = getLength(relevantItem.name);
        longestNameLength =
          length > longestNameLength ? length : longestNameLength;
        newDataset.push(result);
        // }
        previousDate = item.timestamp;
      }
    }
    dataSets.push(newDataset);
  }
  let letterLength = 7;
  let labelLegendStart = 45;

  let domainMax =
    maxProbability < 0.5 ? Math.round(10 * (maxProbability + 0.05)) / 10 : 1;
  let dataSetsLength = dataSets.length;
  let goldenRatio = (1 + Math.sqrt(5)) / 2;
  let width = 750;
  let height = width / goldenRatio;
  let padding = {
    top: 20,
    bottom: 50,
    left: 0,
    right: labelLegendStart + letterLength * longestNameLength,
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-10/12">
        <a
          className="text‑inherit no-underline"
          href={question.url}
          target="_blank"
        ></a>
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
            style={{ border: { stroke: "black" }, labels: { fontSize: 15 } }}
            data={Array.from(Array(dataSetsLength).keys()).map((i) => ({
              name: dataSetsNames[i],
              symbol: { fill: colors[i] },
            }))}
          />

          {dataSets
            .slice(0, 5)
            .map((dataset, i) => getVictoryGroup(dataset, i))}
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
            // label="Date (dd/mm/yy)"
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
      </div>
    </div>
  );
};
