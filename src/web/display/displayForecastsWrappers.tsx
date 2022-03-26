import displayForecasts from './displayForecasts';
import displayOneForecast from './displayOneForecastForCapture';

export function displayForecastsWrapperForSearch({
  results,
  numDisplay,
  showIdToggle,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayForecasts({ results: results || [], numDisplay, showIdToggle })}
    </div>
  );
}

export function displayForecastsWrapperForCapture({
  results,
  whichResultToDisplayAndCapture,
}) {
  return (
    <div className="grid grid-cols-1 w-full justify-center">
      {displayOneForecast({
        result: results[whichResultToDisplayAndCapture],
      })}
    </div>
  );
}
