import { useRouter } from "next/router";
import React, { Fragment, useState } from "react";

import { ButtonsForStars } from "../display/ButtonsForStars";
import { MultiSelectPlatform } from "../display/MultiSelectPlatform";
import { QueryForm } from "../display/QueryForm";
import { SliderElement } from "../display/SliderElement";
import { useNoInitialEffect } from "../hooks";
import { FrontendQuestion } from "../platforms";
import searchAccordingToQueryData from "../worker/searchAccordingToQueryData";
import { Props as AnySearchPageProps, QueryParameters } from "./anySearchPage";

interface Props extends AnySearchPageProps {
  hasSearchbar: boolean;
  hasCapture: boolean;
  hasAdvancedOptions: boolean;
  placeholder: string;
  displaySeeMoreHint: boolean;
  displayQuestionsWrapper: (opts: {
    results: FrontendQuestion[];
    numDisplay: number;
    whichResultToDisplayAndCapture: number;
    showIdToggle: boolean;
  }) => React.ReactNode;
}

/* Body */
const CommonDisplay: React.FC<Props> = ({
  defaultResults,
  initialResults,
  initialQueryParameters,
  defaultQueryParameters,
  initialNumDisplay,
  defaultNumDisplay,
  platformsConfig,
  hasSearchbar,
  hasCapture,
  hasAdvancedOptions,
  placeholder,
  displaySeeMoreHint,
  displayQuestionsWrapper,
}) => {
  const router = useRouter();
  /* States */

  const [queryParameters, setQueryParameters] = useState<QueryParameters>(
    initialQueryParameters
  );

  const [numDisplay, setNumDisplay] = useState(initialNumDisplay);

  // used to distinguish numDisplay updates which force search and don't force search, see effects below
  const [forceSearch, setForceSearch] = useState(0);

  const [results, setResults] = useState(initialResults);
  const [advancedOptions, showAdvancedOptions] = useState(false);
  const [whichResultToDisplayAndCapture, setWhichResultToDisplayAndCapture] =
    useState(0);
  const [showIdToggle, setShowIdToggle] = useState(false);

  /* Functions which I want to have access to the Home namespace */
  // I don't want to create an "defaultResults" object for each search.
  async function executeSearchOrAnswerWithDefaultResults() {
    const queryData = {
      ...queryParameters,
      numDisplay,
    };

    const filterManually = (
      queryData: QueryParameters,
      results: FrontendQuestion[]
    ) => {
      if (
        queryData.forecastingPlatforms &&
        queryData.forecastingPlatforms.length > 0
      ) {
        results = results.filter((result) =>
          queryData.forecastingPlatforms.includes(result.platform)
        );
      }
      if (queryData.starsThreshold === 4) {
        results = results.filter(
          (result) => result.qualityindicators.stars >= 4
        );
      }
      if (queryData.forecastsThreshold) {
        // results = results.filter(result => (result.qualityindicators && result.qualityindicators.numforecasts > forecastsThreshold))
      }
      return results;
    };

    const queryIsEmpty =
      !queryData || queryData.query == "" || queryData.query == undefined;

    const results = queryIsEmpty
      ? filterManually(queryData, defaultResults)
      : await searchAccordingToQueryData(queryData, numDisplay);

    setResults(results);
  }

  // I don't want the component which display questions (DisplayQuestions) to change with a change in queryParameters. But I want it to have access to the queryParameters, and in particular access to queryParameters.numDisplay. Hence why this function lives inside Home.
  const getInfoToDisplayQuestionsFunction = () => {
    const numDisplayRounded =
      numDisplay % 3 != 0
        ? numDisplay + (3 - (Math.round(numDisplay) % 3))
        : numDisplay;
    return displayQuestionsWrapper({
      results,
      numDisplay: numDisplayRounded,
      whichResultToDisplayAndCapture,
      showIdToggle,
    });
  };

  const updateRoute = () => {
    const stringify = (key: string, value: any) => {
      if (key === "forecastingPlatforms") {
        return value.join("|");
      } else {
        return String(value);
      }
    };

    const query = {};
    for (const key of Object.keys(defaultQueryParameters)) {
      const value = stringify(key, queryParameters[key]);
      const defaultValue = stringify(key, defaultQueryParameters[key]);
      if (value === defaultValue) continue;
      query[key] = value;
    }

    if (numDisplay !== defaultNumDisplay) query["numDisplay"] = numDisplay;

    router.replace(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  useNoInitialEffect(updateRoute, [numDisplay]);

  useNoInitialEffect(() => {
    setResults([]);
    const newTimeoutId = setTimeout(() => {
      updateRoute();
      executeSearchOrAnswerWithDefaultResults();
    }, 500);

    // avoid sending results if user has not stopped typing.
    return () => {
      clearTimeout(newTimeoutId);
    };
  }, [queryParameters, forceSearch]);

  /* State controllers */

  /* Change the stars threshold */
  const onChangeStars = (value: number) => {
    setQueryParameters({
      ...queryParameters,
      starsThreshold: value,
    });
  };

  /* Change the number of elements to display  */
  const displayFunctionNumDisplaySlider = (value: number) => {
    return (
      "Show " +
      Math.round(value) +
      " result" +
      (Math.round(value) === 1 ? "" : "s")
    );
  };
  const onChangeSliderForNumDisplay = (event) => {
    setNumDisplay(Math.round(event[0]));
    setForceSearch(forceSearch + 1); // FIXME - force new search iff numDisplay is greater than last search limit
  };

  /* Change the forecast threshold */
  const displayFunctionNumForecasts = (value: number) => {
    return "# Forecasts > " + Math.round(value);
  };
  const onChangeSliderForNumForecasts = (event) => {
    setQueryParameters({
      ...queryParameters,
      forecastsThreshold: Math.round(event[0]),
    });
  };

  /* Change on the search bar */
  const onChangeSearchBar = (value: string) => {
    setQueryParameters({
      ...queryParameters,
      query: value,
    });
  };

  /* Change selected platforms */
  const onChangeSelectedPlatforms = (value) => {
    setQueryParameters({
      ...queryParameters,
      forecastingPlatforms: value,
    });
  };

  // Change show id
  const onChangeShowId = () => {
    setShowIdToggle(!showIdToggle);
  };

  // Capture functionality
  const onClickBack = () => {
    const decreaseUntil0 = (num: number) => (num - 1 > 0 ? num - 1 : 0);
    setWhichResultToDisplayAndCapture(
      decreaseUntil0(whichResultToDisplayAndCapture)
    );
  };
  const onClickForward = (whichResultToDisplayAndCapture: number) => {
    setWhichResultToDisplayAndCapture(whichResultToDisplayAndCapture + 1);
  };

  /* Final return */
  return (
    <Fragment>
      <label className="mb-4 mt-4 flex flex-row justify-center items-center">
        {hasSearchbar ? (
          <div className="w-10/12 mb-2">
            <QueryForm
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
                platformsConfig={platformsConfig}
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

      <div>{getInfoToDisplayQuestionsFunction()}</div>

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
