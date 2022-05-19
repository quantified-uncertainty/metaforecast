import { differenceInDays, format } from "date-fns";
import {
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryStack,
  VictoryLabel,
  VictoryLine,
  VictoryScatter,
  VictoryArea,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";

import { chartColors, ChartData, ChartSeries, height, width } from "./utils";

let dateFormat = "MMM do y"; // "yyyy-MM-dd"

// can't be replaced with React component, VictoryChart requires VictoryGroup elements to be immediate children
const getVictoryGroup = ({
  data,
  i,
  highlight,
  isBinary,
}: {
  data: ChartSeries;
  i: number;
  highlight?: boolean;
  isBinary?: boolean;
}) => {
  return (
    <VictoryGroup color={chartColors[i] || "darkgray"} data={data} key={i}>
      <VictoryLine
        name={`line-${i}`}
        style={{
          data: {
            // strokeOpacity: highlight ?  1 : 0.5,
            strokeOpacity: 0.6,
            strokeWidth: isBinary ? 4 : 3,
          },
        }}
      />
      {isBinary ? (
        <VictoryArea
          standalone={false}
          style={{
            data: { fill: chartColors[i], fillOpacity: 0.1, strokeOpacity: 0 },
          }}
          data={data}
        />
      ) : null}

      <VictoryScatter
        name={`scatter-${i}`}
        size={({ active }) => (active || highlight ? 0 : 0)} //(active || highlight ? 3.75 : 3)}
      />
    </VictoryGroup>
  );
};

export type Props = {
  data: ChartData;
  highlight: number | undefined;
};

export const InnerChart: React.FC<Props> = ({
  data: { maxProbability, seriesList, minDate, maxDate },
  highlight,
}) => {
  const domainMax =
    maxProbability < 0.5 ? Math.round(10 * (maxProbability + 0.05)) / 10 : 1;
  const padding = {
    top: 20,
    bottom: 75,
    left: 70,
    right: 17,
  };

  const isBinary = seriesList.length == 1;
  console.log(isBinary);

  return (
    <VictoryChart
      domainPadding={0}
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
                  dateFormat
                )}`
              }
              style={{
                fontSize: 17, // needs to be set here and not just in labelComponent for text size calculations
                fontFamily:
                  '"Gill Sans", "Gill Sans MT", "Ser­avek", "Trebuchet MS", sans-serif',
                // default font family from Victory, need to be specified explicitly for some reason, otherwise text size gets miscalculated
              }}
              flyoutStyle={{
                stroke: "#999",
                fill: "white",
              }}
              cornerRadius={4}
              flyoutPadding={{ top: 4, bottom: 4, left: 16, right: 16 }}
            />
          }
          radius={50}
          voronoiBlacklist={
            [...Array(seriesList.length).keys()].map((i) => `line-${i}`)
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
      <VictoryAxis
        tickCount={Math.min(7, differenceInDays(maxDate, minDate) + 1)}
        style={{
          grid: { strokeWidth: 0.5 },
        }}
        tickLabelComponent={
          <VictoryLabel
            dx={-40}
            dy={0}
            angle={-30}
            style={{ fontSize: 15, fill: "#777" }}
          />
        }
        scale={{ x: "time" }}
        tickFormat={(t) => format(t, dateFormat)}
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

      {[...Array(seriesList.length).keys()]
        .reverse() // affects svg render order, we want to render largest datasets on top of others
        //.filter((i) => i !== highlight)
        .map((i) =>
          getVictoryGroup({
            data: seriesList[i],
            i,
            highlight: i == highlight, // false
            isBinary: isBinary,
          })
        )}

      {
        // note: this produces an annoying change of color effect
        /*
        highlight === undefined
        ? null
        : // render highlighted series on top of everything else
          getVictoryGroup({
            data: seriesList[highlight],
            i: highlight, 
            highlight: true,
          })
        */
      }
    </VictoryChart>
  );
};
