import React, { Fragment, useEffect, useState } from 'react';

import { platformNames, PlatformWithLabel } from '../platforms';
import searchAccordingToQueryData from '../worker/searchAccordingToQueryData';
import ButtonsForStars from './buttonsForStars';
import Form from './form';
import MultiSelectPlatform from './multiSelectPlatforms';
import { SliderElement } from './slider';

interface QueryParametersWithoutNum {
  query: string;
  starsThreshold: number;
  forecastsThreshold: number;
  forecastingPlatforms: PlatformWithLabel[];
}

export interface QueryParameters extends QueryParametersWithoutNum {
  numDisplay: number;
}

interface Props {
  defaultResults: any;
  initialQueryParameters: QueryParameters;
  hasSearchbar: boolean;
  hasCapture: boolean;
  hasAdvancedOptions: boolean;
  placeholder: string;
  displaySeeMoreHint: boolean;
  displayForecastsWrapper: (opts: {
    results: any;
    numDisplay: number;
    whichResultToDisplayAndCapture: number;
    showIdToggle: boolean;
  }) => React.ReactNode;
}

/* Helper functions */

// URL slugs
let transformObjectIntoUrlSlug = (obj: QueryParameters) => {
  let results = [];
  for (let key in obj) {
    if (typeof obj[key] === "number" || typeof obj[key] === "string") {
      results.push(`${key}=${obj[key]}`);
    } else if (key === "forecastingPlatforms") {
      let arr = obj[key].map((x) => x.value);
      let arrstring = arr.join("|");
      results.push(`${key}=${arrstring}`);
    }
  }
  let string = "?" + results.join("&");
  return string;
};

/* Body */
const CommonDisplay: React.FC<Props> = ({
  defaultResults,
  initialQueryParameters,
  hasSearchbar,
  hasCapture,
  hasAdvancedOptions,
  placeholder,
  displaySeeMoreHint,
  displayForecastsWrapper,
}) => {
  /* States */

  const [queryParameters, setQueryParameters] =
    useState<QueryParametersWithoutNum>(initialQueryParameters);

  const [numDisplay, setNumDisplay] = useState(
    initialQueryParameters.numDisplay || 21
  );

  const [results, setResults] = useState([]);
  const [advancedOptions, showAdvancedOptions] = useState(false);
  const [whichResultToDisplayAndCapture, setWhichResultToDisplayAndCapture] =
    useState(0);
  const [showIdToggle, setShowIdToggle] = useState(false);

  /* Functions which I want to have access to the Home namespace */
  // I don't want to create an "defaultResults" object for each search.
  async function executeSearchOrAnswerWithDefaultResults(
    queryData: QueryParameters
  ) {
    // the queryData object has the same contents as queryParameters.
    // but I wanted to spare myself having to think about namespace conflicts.
    let filterManually = (queryData: QueryParameters, results) => {
      if (
        queryData.forecastingPlatforms &&
        queryData.forecastingPlatforms.length > 0
      ) {
        let forecastingPlatforms = queryData.forecastingPlatforms.map(
          (platformObj) => platformObj.value
        );
        results = results.filter((result) =>
          forecastingPlatforms.includes(result.item.platform)
        );
      }
      if (queryData.starsThreshold === 4) {
        results = results.filter(
          (result) => result.item.qualityindicators.stars >= 4
        );
      }
      if (queryData.forecastsThreshold) {
        // results = results.filter(result => (result.qualityindicators && result.item.qualityindicators.numforecasts > forecastsThreshold))
      }
      return results;
    };

    const queryIsEmpty =
      !queryData || queryData.query == "" || queryData.query == undefined;

    let results = queryIsEmpty
      ? filterManually(queryData, defaultResults)
      : await searchAccordingToQueryData(queryData);

    setResults(results);
  }

  // I don't want the function which display forecasts (displayForecasts) to change with a change in queryParameters. But I want it to have access to the queryParameters, and in particular access to queryParameters.numDisplay. Hence why this function lives inside Home.
  let getInfoToDisplayForecastsFunction = ({
    results,
    whichResultToDisplayAndCapture,
    showIdToggle,
  }) => {
    let numDisplayRounded =
      numDisplay % 3 != 0
        ? numDisplay + (3 - (Math.round(numDisplay) % 3))
        : numDisplay;
    return displayForecastsWrapper({
      results,
      numDisplay: numDisplayRounded,
      whichResultToDisplayAndCapture,
      showIdToggle,
    });
  };

  useEffect(() => {
    setResults([]);
    let newTimeoutId = setTimeout(async () => {
      let urlSlug = transformObjectIntoUrlSlug({
        ...queryParameters,
        numDisplay,
      });
      let urlWithoutDefaultParameters = urlSlug
        .replace("?query=&", "?")
        .replace("&starsThreshold=2", "")
        .replace("&numDisplay=21", "")
        .replace("&forecastsThreshold=0", "")
        .replace(`&forecastingPlatforms=${platformNames.join("|")}`, "");
      console.log(urlWithoutDefaultParameters);
      if (urlWithoutDefaultParameters != "?query=") {
        if (typeof window !== "undefined") {
          if (!window.location.href.includes(urlWithoutDefaultParameters)) {
            window.history.replaceState(
              null,
              "Metaforecast",
              urlWithoutDefaultParameters
            );
          }
        }
      }

      executeSearchOrAnswerWithDefaultResults({
        ...queryParameters,
        numDisplay,
      });
    }, 500);

    // avoid sending results if user has not stopped typing.
    return () => {
      clearTimeout(newTimeoutId);
    };
  }, [queryParameters]);

  /* State controllers */

  /* Change the stars threshold */
  let onChangeStars = (value: number) => {
    setQueryParameters({
      ...queryParameters,
      starsThreshold: value,
    });
  };

  /* Change the number of elements to display  */
  let displayFunctionNumDisplaySlider = (value) => {
    return (
      "Show " +
      Math.round(value) +
      " result" +
      (Math.round(value) === 1 ? "" : "s")
    );
  };
  let onChangeSliderForNumDisplay = (event) => {
    setNumDisplay(Math.round(event[0]));
    // FIXME - force new search if numDisplay is greater than last search limit
  };

  /* Change the forecast threshold */
  let displayFunctionNumForecasts = (value: number) => {
    return "# Forecasts > " + Math.round(value);
  };
  let onChangeSliderForNumForecasts = (event) => {
    setQueryParameters({
      ...queryParameters,
      forecastsThreshold: Math.round(event[0]),
    });
  };

  /* Change on the search bar */
  let onChangeSearchBar = (value: string) => {
    setQueryParameters({
      ...queryParameters,
      query: value,
    });
  };

  /* Change selected platforms */
  let onChangeSelectedPlatforms = (value) => {
    setQueryParameters({
      ...queryParameters,
      forecastingPlatforms: value,
    });
  };

  // Change show id
  let onChangeShowId = () => {
    setShowIdToggle(!showIdToggle);
  };

  // Capture functionality
  let onClickBack = () => {
    let decreaseUntil0 = (num: number) => (num - 1 > 0 ? num - 1 : 0);
    setWhichResultToDisplayAndCapture(
      decreaseUntil0(whichResultToDisplayAndCapture)
    );
  };
  let onClickForward = (whichResultToDisplayAndCapture: number) => {
    setWhichResultToDisplayAndCapture(whichResultToDisplayAndCapture + 1);
  };

  /* Final return */
  return (
    <Fragment>
      <label className="mb-4 mt-4 flex flex-row justify-center items-center">
        {hasSearchbar ? (
          <div className="w-10/12 mb-2">
            <Form
              value={queryParameters.query}
              onChange={onChangeSearchBar}
              placeholder={placeholder}
            />
          </div>
        ) : null}

        {hasAdvancedOptions ? (
          <div className="w-2/12 flex justify-center ml-4 md:ml-2 lg:ml-0">
            <button
              className="text-gray-500 text-sm mb-2"
              onClick={() => showAdvancedOptions(!advancedOptions)}
            >
              Advanced options ▼
            </button>
          </div>
        ) : null}

        {hasCapture ? (
          <div className="w-2/12 flex justify-center ml-4 md:ml-2 gap-1 lg:ml-0">
            <button
              className="text-blue-500 cursor-pointer text-xl mb-3 pr-3 hover:text-blue-600"
              onClick={() => onClickBack()}
            >
              ◀
            </button>
            <button
              className="text-blue-500 cursor-pointer text-xl mb-3 pl-3 hover:text-blue-600"
              onClick={() => onClickForward(whichResultToDisplayAndCapture)}
            >
              ▶
            </button>
          </div>
        ) : null}
      </label>

      {hasAdvancedOptions && advancedOptions ? (
        <div className="flex-1 flex-col mx-auto justify-center items-center w-full">
          <div className="grid sm:grid-rows-4 sm:grid-cols-1 md:grid-rows-2 lg:grid-rows-2 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 items-center content-center bg-gray-50 rounded-md px-8 pt-4 pb-1 shadow mb-4">
            <div className="flex row-start-1 row-end-1  col-start-1 col-end-4 md:row-span-1 md:col-start-1 md:col-end-1 md:row-start-1 md:row-end-1 lg:row-span-1 lg:col-start-1 lg:col-end-1 lg:row-start-1 lg:row-end-1 items-center justify-center mb-4">
              <SliderElement
                onChange={onChangeSliderForNumForecasts}
                value={queryParameters.forecastsThreshold}
                displayFunction={displayFunctionNumForecasts}
              />
            </div>
            <div className="flex row-start-2 row-end-2 col-start-1 col-end-4 md:row-start-1 md:row-end-1 md:col-start-2 md:col-end-2 lg:row-start-1 lg:row-end-1 lg:col-start-2 items-center justify-center mb-4">
              <ButtonsForStars
                onChange={onChangeStars}
                value={queryParameters.starsThreshold}
              />
            </div>
            <div className="flex row-start-3 row-end-3 col-start-1 col-end-4 md:col-start-3 md:col-end-3 md:row-start-1 md:row-end-1 lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-1 items-center justify-center mb-4">
              <SliderElement
                value={numDisplay}
                onChange={onChangeSliderForNumDisplay}
                displayFunction={displayFunctionNumDisplaySlider}
              />
            </div>
            <div className="flex col-span-3 items-center justify-center">
              <MultiSelectPlatform
                value={queryParameters.forecastingPlatforms}
                onChange={onChangeSelectedPlatforms}
              />
            </div>
            <button
              className="block col-start-1 col-end-4 md:col-start-2 md:col-end-3 md:row-start-4 md:row-end-4 lg:col-start-2 lg:col-end-3 lg:row-start-4 lg:row-end-4 bg-transparent hover:bg-blue-300 text-blue-400 hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mt-5 p-10 text-center mb-2 mr-10 ml-10 items-center justify-center"
              onClick={onChangeShowId}
            >
              Toggle show id
            </button>
          </div>
        </div>
      ) : null}

      <div>
        {getInfoToDisplayForecastsFunction({
          results,
          whichResultToDisplayAndCapture,
          showIdToggle,
        })}
      </div>

      {displaySeeMoreHint &&
      (!results || (results.length != 0 && numDisplay < results.length)) ? (
        <div>
          <p className="mt-4 mb-4">
            {"Can't find what you were looking for?"}
            <span
              className={`cursor-pointer text-blue-800 ${
                !results ? "hidden" : ""
              }`}
              onClick={() => {
                setNumDisplay(numDisplay * 2);
              }}
            >
              {" Show more,"}
            </span>
            {" or "}
            <a
              href="https://www.metaculus.com/questions/create/"
              className="cursor-pointer text-blue-800 no-underline"
              target="_blank"
            >
              suggest a question on Metaculus
            </a>
          </p>
        </div>
      ) : null}

      <br></br>
    </Fragment>
  );
};

export default CommonDisplay;
