import React from "react";
import {
    VictoryAxis, VictoryChart, VictoryGroup, VictoryLabel, VictoryLegend, VictoryScatter,
    VictoryTheme, VictoryTooltip, VictoryVoronoiContainer
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
  }));

const colors = ["dodgerblue", "crimson", "seagreen", "darkviolet", "turquoise"];
const getVictoryGroup = (data, i) => {
  return (
    <VictoryGroup color={colors[i] || "darkgray"} data={dataAsXy(data)}>
      <VictoryScatter
        //style={{ labels: { display: "none" } }}
        size={({ active }) => (active ? 3.75 : 3)}
        //labels={() => null}
        //labelComponent={<span></span>}
      />

      {/* Doesn't work well with tooltips
        <VictoryLine
          name={`line${i}`}
          //style={{ labels: { display: "none" } }}
          //labels={() => null}
          //labelComponent={<span></span>}
        />
        */}
    </VictoryGroup>
  );
};

export const HistoryChart: React.FC<Props> = ({ question }) => {
  let height = 400;
  let width = 500;
  let padding = { top: 20, bottom: 50, left: 50, right: 100 };
  // let dataSetsNames = ["Yes", "No", "Maybe", "Perhaps", "Possibly"];
  let dataSetsNames = [];
  question.history.forEach((item) => {
    let optionNames = item.options.map((option) => option.name);
    dataSetsNames.push(...optionNames);
  });
  dataSetsNames = [...new Set(dataSetsNames)].slice(0, 5); // take the first 5
  let dataSets = [];
  dataSetsNames.forEach((name) => {
    let newDataset = [];
    question.history.forEach((item) => {
      let relevantItemsArray = item.options.filter((x) => x.name == name);
      let date = new Date(item.timestamp * 1000);
      if (relevantItemsArray.length == 1) {
        let relevantItem = relevantItemsArray[0];
        // if (relevantItem.type == "PROBABILITY") {
        let result = {
          date,
          probability: relevantItem.probability,
        };
        newDataset.push(result);
        // }
      }
    });
    dataSets.push(newDataset);
  });

  let dataSetsLength = dataSets.length;

  return (
    <div className="grid grid-rows-1 bg-white p-10">
      <a
        className="text‑inherit no-underline"
        href={question.url}
        target="_blank"
      >
        <h1 className="text-3xl font-normal text-center mt-5">
          {question.title}
        </h1>
      </a>
      <VictoryChart
        domainPadding={20}
        padding={padding}
        theme={VictoryTheme.material}
        height={height}
        width={width}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => `${datum.x}: ${Math.round(datum.y * 100)}%`}
            labelComponent={
              <VictoryTooltip
                pointerLength={0}
                dy={-12}
                style={{
                  fontSize: 10,
                  fill: "black",
                  strokeWidth: 0.05,
                }}
                flyoutStyle={{
                  stroke: "black",
                  fill: "white",
                }}
                flyoutWidth={80}
                cornerRadius={0}
                flyoutPadding={7}
              />
            }
            voronoiBlacklist={
              ["line0", "line1", "line2", "line3", "line4"]

              //Array.from(Array(5).keys()).map((x, i) => `line${i}`)
              // see: https://github.com/FormidableLabs/victory/issues/545
            }
          />
        }
        domain={{
          y: [0, 1],
        }}
      >
        <VictoryLegend
          x={width - 100}
          y={height / 2 - 18 - (dataSetsLength - 1) * 13}
          orientation="vertical"
          gutter={20}
          style={{ border: { stroke: "black" }, title: { fontSize: 20 } }}
          data={
            Array.from(Array(dataSetsLength).keys()).map((i) => ({
              name: dataSetsNames[i],
              symbol: { fill: colors[i] },
            }))
            /*[
            { name: "One", symbol: { fill: "tomato", type: "star" } },
            { name: "Two", symbol: { fill: "orange" } },
            { name: "Three", symbol: { fill: "gold" } },
          ]*/
          }
        />

        {dataSets.slice(0, 5).map((dataset, i) => getVictoryGroup(dataset, i))}
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
              dy={0}
              angle={-30}
              style={{ fontSize: 10, fill: "gray" }}
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
            <VictoryLabel dy={0} style={{ fontSize: 10, fill: "gray" }} />
          }
        />
      </VictoryChart>
    </div>
  );
};
