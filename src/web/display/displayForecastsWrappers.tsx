import { DisplayForecasts } from "./DisplayForecasts";
import { DisplayOneForecastForCapture } from "./DisplayOneForecastForCapture";

export function displayForecastsWrapperForSearch({
  results,
  numDisplay,
  showIdToggle,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DisplayForecasts
        results={results || []}
        numDisplay={numDisplay}
        showIdToggle={showIdToggle}
      />
    </div>
  );
}

export function displayForecastsWrapperForCapture({
  results,
  whichResultToDisplayAndCapture,
}) {
  return (
    <div className="grid grid-cols-1 w-full justify-center">
      <DisplayOneForecastForCapture
        result={results[whichResultToDisplayAndCapture]}
      />
    </div>
  );
}
