import React from "react";

import { FrontendForecast } from "../platforms";
import * as V from "victory";
import {
  VictoryBar,
  VictoryLabel,
  VictoryTooltip,
  VictoryLine,
  VictoryScatter,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryGroup,
  VictoryVoronoiContainer,
} from "victory";

interface Props {
  question: FrontendForecast;
  history: number[];
}

const data = [
  { date: 1, probability: 0.1 },
  { date: 2, probability: 0.2 },
  { date: 3, probability: 0.4 },
  { date: 4, probability: 0.6 },
  { date: 5, probability: 0.6 },
  { date: 6, probability: 0.65 },
  { date: 7, probability: 0.65 },
  { date: 8, probability: 0.65 },
  { date: 9, probability: 0.7 },
];

let getDate = (x) => {
  let date = new Date(x);
  return date.toISOString().slice(5, 10).replaceAll("-", "/");
};

let dataAsXy = data.map((datum) => ({
  x: getDate(datum.date * (1000 * 60 * 60 * 24)),
  y: datum.probability,
}));

export const HistoryChart: React.FC<Props> = ({ question, history }) => {
  return (
    <VictoryChart
      domainPadding={20}
      theme={VictoryTheme.material}
      height={300}
      containerComponent={<VictoryVoronoiContainer />}
      domain={{
        y: [0, 1],
      }}
    >
      <VictoryGroup
        color="#c43a31"
        data={dataAsXy}
        labels={({ datum }) => `${datum.y * 100}%`}
        labelComponent={
          <VictoryTooltip style={{ fontSize: 10, fill: "black" }} />
        }
      >
        <VictoryLine />
        <VictoryScatter size={({ active }) => (active ? 8 : 3)} />
      </VictoryGroup>
      <VictoryAxis
        // tickValues specifies both the number of ticks and where
        // they are placed on the axis
        tickValues={data.map((datum) => datum.date)}
        tickFormat={dataAsXy.map((datum) => datum.x)}
        style={{
          grid: { stroke: null, strokeWidth: 0.5 },
        }}
        tickLabelComponent={
          <VictoryLabel
            dy={0}
            angle={-30}
            style={{ fontSize: 7, fill: "gray" }}
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
      />
    </VictoryChart>
  );
};

/*
    <VictoryChart
      // domainPadding will add space to each side of VictoryBar to
      // prevent it from overlapping the axis
      domainPadding={20}
      theme={VictoryTheme.material}
      height={300}
      title={"Blah"}
      containerComponent={<VictoryVoronoiContainer />}
    >
      <VictoryGroup
        data={data.map((datum) => ({ x: datum.date, y: datum.probability }))}
        labels={data.map((datum) => `1%`)}
        style={{ labels: { fill: "black", fontSize: 10 } }}
        labelComponent={
          <VictoryTooltip style={{ fontSize: 10, fill: "black" }} dy={-15} />
        }
      >
        <VictoryLine
          height={300}
          width={300}
          style={{
            data: { stroke: "#000080" },
            parent: { border: "1px solid #ccc" },
          }}
          domain={{
            y: [0, 1],
          }}
        ></VictoryLine>
        <VictoryScatter
          style={{
            data: { fill: "#000080" },
          }}
          size={3}
        />
      </VictoryGroup>
    </VictoryChart>
*/
