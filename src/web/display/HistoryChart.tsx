import React from "react";

import { FrontendForecast } from "../platforms";
import * as V from "victory";
import { HistoryChartFlyout } from "./HistoryChartFlyout";
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

const data0 = [
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

let l = 50;
const data = Array.from(Array(l).keys()).map((x) => ({
  date: x,
  probability: Math.abs(Math.sin((5 * x) / l)),
}));

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
    <div className="">
      <VictoryChart
        domainPadding={20}
        theme={VictoryTheme.material}
        height={400}
        width={500}
        containerComponent={<VictoryVoronoiContainer />}
        domain={{
          y: [0, 1],
        }}
      >
        <VictoryLabel
          text="Chart Title"
          x={250}
          y={25}
          textAnchor="middle"
          style={{ fontSize: 20 }}
        />
        <VictoryGroup
          color="darkblue"
          data={dataAsXy}
          labels={({ datum }) => `${datum.x}: ${Math.round(datum.y * 100)}%`}
          labelComponent={
            <VictoryTooltip
              pointerLength={0}
              dy={-12}
              style={{
                fontSize: 16,
                fill: "black",
                strokeWidth: 0.05,
              }}
              flyoutStyle={{
                stroke: "black",
                fill: "white",
              }}
              flyoutWidth={110}
              cornerRadius={0}
              flyoutPadding={7}
            />
          }
        >
          <VictoryLine />
          <VictoryScatter size={({ active }) => (active ? 3.75 : 3)} />
        </VictoryGroup>
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
              style={{ fontSize: 12, fill: "gray" }}
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
            <VictoryLabel dy={0} style={{ fontSize: 12, fill: "gray" }} />
          }
        />
      </VictoryChart>
    </div>
  );
};
