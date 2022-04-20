import React from "react";

import { FrontendForecast } from "../platforms";
import * as V from "victory";
import {
  VictoryBar,
  VictoryLabel,
  VictoryTooltip,
  VictoryLegend,
  VictoryLine,
  VictoryScatter,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryGroup,
  VictoryVoronoiContainer,
} from "victory";
import ReactMarkdown from "react-markdown";
import { cleanText } from "../utils";
import gfm from "remark-gfm";

interface Props {
  question: FrontendForecast;
  history: number[];
}

let l = 50;
const data = Array.from(Array(l).keys()).map((x) => ({
  date: x,
  probability: Math.abs(Math.sin((5 * x) / l)),
}));

const data2 = Array.from(Array(l).keys()).map((x) => ({
  date: x,
  probability: 1 - Math.abs(Math.sin((5 * x) / l)),
}));

const data3 = Array.from(Array(l).keys()).map((x) => ({
  date: x,
  probability: 1 - Math.abs(Math.sin((5 * x + 20) / l)),
}));

const buildDataset = (n, fn) => {
  return Array.from(Array(n).keys()).map((x) => ({
    date: x,
    probability: fn(x),
  }));
};

let getDate = (x) => {
  let date = new Date(x);
  return date.toISOString().slice(5, 10).replaceAll("-", "/");
};

let dataAsXy = (data) =>
  data.map((datum) => ({
    x: getDate(datum.date * (1000 * 60 * 60 * 24)),
    y: datum.probability,
  }));

let colors = ["dodgerblue", "crimson", "seagreen", "darkviolet", "turquoise"];
const getVictoryGroup = (data, i) => {
  return (
    <VictoryGroup color={colors[i] || "darkgray"} data={dataAsXy(data)}>
      <VictoryLine
        name={`line${i}`}
        style={{ labels: { display: "none" } }}
        labels={() => null}
        labelComponent={<span></span>}
      />
      {
        <VictoryScatter
          style={{ labels: { display: "none" } }}
          size={({ active }) => (active ? 3.75 : 3)}
          labels={() => null}
          labelComponent={<span></span>}
        />
        // No idea how to disable labels
      }
    </VictoryGroup>
  );
};

export const HistoryChart: React.FC<Props> = ({ question, history }) => {
  let height = 400;
  let width = 500;
  let dataSetsNames = ["Yes", "No", "Maybe", "Perhaps", "Possibly"];
  let dataSets = [
    buildDataset(50, (x) => 0.5),
    buildDataset(50, (x) => Math.abs(Math.sin((5 * x) / 50) / 2)),
    buildDataset(50, (x) => 1 - Math.abs(Math.sin((5 * x) / 50) / 2)),
    buildDataset(50, (x) => Math.abs(Math.sin((3 * x + 25) / 50))),
    buildDataset(50, (x) => 1 - Math.abs(Math.sin((3 * x + 25) / 50))),
  ];
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
        padding={{ top: 20, bottom: 50, left: 50, right: 100 }}
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
              Array.from(Array(5).keys()).map((x, i) => `line${i}`)
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

      <ReactMarkdown
        remarkPlugins={[gfm]}
        children={question.description}
        className="m-5 text-lg"
      />
    </div>
  );
};
