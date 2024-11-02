"use client";
import React, { FC, useMemo, useState } from "react";

import { clsx } from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "urql";

import { PlatformConfig } from "../../../backend/platforms";
import { MultiSelectPlatform } from "../../common/MultiSelectPlatform";
import { ButtonsForStars } from "../../display/ButtonsForStars";
import { SliderElement } from "../../display/SliderElement";
import { QuestionFragment } from "../../fragments.generated";
import { useIsFirstRender, useNoInitialEffect } from "../../hooks";
import { QuestionCardsList } from "../../questions/components/QuestionCardsList";
import { SearchDocument } from "../queries.generated";
import { QueryForm } from "./QueryForm";

export interface QueryParameters {
  query: string;
  starsThreshold: number;
  forecastsThreshold: number;
  forecastingPlatforms: string[]; // platform names
}

export type Props = {
  defaultResults: QuestionFragment[];
  initialQueryParameters: QueryParameters;
  defaultQueryParameters: QueryParameters;
  initialNumDisplay: number;
  defaultNumDisplay: number;
  platformsConfig: PlatformConfig[];
};

/* Body */
export const SearchScreen: FC<Props> = ({
  defaultResults,
  initialQueryParameters,
  defaultQueryParameters,
  initialNumDisplay,
  defaultNumDisplay,
  platformsConfig,
}) => {
  /* States */
  const router = useRouter();
  const pathname = usePathname();
  const isFirstRender = useIsFirstRender();

  const [queryParameters, setQueryParameters] = useState<QueryParameters>(
    initialQueryParameters
  );

  const [numDisplay, setNumDisplay] = useState(initialNumDisplay);

  // used to distinguish numDisplay updates which force search and don't force search, see effects below
  const [forceSearch, setForceSearch] = useState(0);

  const [advancedOptions, showAdvancedOptions] = useState(false);
  const [showIdToggle, setShowIdToggle] = useState(false);

  const [typing, setTyping] = useState(false);

  // must match the query from anySearchPage.ts getServerSideProps
  const [queryResults, reexecuteQuery] = useQuery({
    query: SearchDocument,
    variables: {
      input: {
        ...queryParameters,
        limit: numDisplay + 50,
      },
    },
    pause: !isFirstRender,
  });

  const queryIsEmpty =
    queryParameters.query === undefined || queryParameters.query === "";

  const results: QuestionFragment[] = useMemo(() => {
    if (typing || (!isFirstRender && queryResults.fetching)) return []; // TODO - return results but show spinner or darken out all cards?

    if (queryIsEmpty) {
      const filterManually = (results: QuestionFragment[]) => {
        let filteredResults = [...results];
        if (
          queryParameters.forecastingPlatforms &&
          queryParameters.forecastingPlatforms.length > 0
        ) {
          filteredResults = filteredResults.filter((result) =>
            queryParameters.forecastingPlatforms.includes(result.platform.id)
          );
        }
        if (queryParameters.starsThreshold === 4) {
          filteredResults = filteredResults.filter(
            (result) => result.qualityIndicators.stars >= 4
          );
        }
        if (queryParameters.forecastsThreshold) {
          // TODO / FIXME / remove?
        }
        return filteredResults;
      };
      return filterManually(defaultResults);
    } else {
      return queryResults.data?.result || [];
    }
  }, [
    typing,
    isFirstRender,
    queryResults.data,
    queryResults.fetching,
    queryIsEmpty,
    queryParameters,
    defaultResults,
  ]);

  // I don't want the component which display questions (DisplayQuestions) to change with a change in queryParameters. But I want it to have access to the queryParameters, and in particular access to queryParameters.numDisplay. Hence why this function lives inside Home.
  const getInfoToDisplayQuestions = () => {
    const numDisplayRounded =
      numDisplay % 3 !== 0
        ? numDisplay + (3 - (Math.round(numDisplay) % 3))
        : numDisplay;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuestionCardsList
          results={results}
          numDisplay={numDisplayRounded}
          showIdToggle={showIdToggle}
        />
      </div>
    );
  };

  const updateRoute = () => {
    const stringify = (key: string, obj: { [k: string]: any }) => {
      const value = obj[key];
      if (key === "forecastingPlatforms") {
        return value.join("|");
      } else {
        return String(value);
      }
    };

    const query: { [k: string]: string } = {};
    for (const key of Object.keys(defaultQueryParameters)) {
      const value = stringify(key, queryParameters);
      const defaultValue = stringify(key, defaultQueryParameters);
      if (value === defaultValue) continue;
      query[key] = value;
    }

    if (numDisplay !== defaultNumDisplay)
      query["numDisplay"] = String(numDisplay);

    router.replace(`${pathname}?${new URLSearchParams(query).toString()}`);
  };

  useNoInitialEffect(updateRoute, [numDisplay]);

  useNoInitialEffect(() => {
    setTyping(true);
    const newTimeoutId = setTimeout(async () => {
      updateRoute();
      if (!queryIsEmpty) {
        reexecuteQuery();
      }
      setTyping(false);
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
  const onChangeSliderForNumDisplay = (value: number) => {
    setNumDisplay(Math.round(value));
    setForceSearch(forceSearch + 1); // FIXME - force new search iff numDisplay is greater than last search limit
  };

  /* Change the forecast threshold */
  const displayFunctionNumForecasts = (value: number) => {
    return "# Forecasts > " + Math.round(value);
  };
  const onChangeSliderForNumForecasts = (value: number) => {
    setQueryParameters({
      ...queryParameters,
      forecastsThreshold: Math.round(value),
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
  const onChangeSelectedPlatforms = (value: string[]) => {
    setQueryParameters({
      ...queryParameters,
      forecastingPlatforms: value,
    });
  };

  // Change show id
  const onChangeShowId = () => {
    setShowIdToggle(!showIdToggle);
  };

  /* Final return */
  return (
    <>
      <label className="mb-4 mt-4 flex flex-row justify-center items-center">
        <div className="w-10/12 mb-2">
          <QueryForm
            value={queryParameters.query}
            onChange={onChangeSearchBar}
            placeholder="Find forecasts about..."
          />
        </div>

        <div className="w-2/12 flex justify-center ml-4 md:ml-2 lg:ml-0">
          <button
            className="text-gray-500 text-sm mb-2"
            onClick={() => showAdvancedOptions(!advancedOptions)}
          >
            Advanced options ▼
          </button>
        </div>
      </label>

      {advancedOptions ? (
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

      <div>{getInfoToDisplayQuestions()}</div>

      {!results || (results.length !== 0 && numDisplay < results.length) ? (
        <div>
          <p className="mt-4 mb-4">
            {"Can't find what you were looking for?"}
            <span
              className={clsx(
                "cursor-pointer text-blue-800",
                !results && "hidden"
              )}
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
    </>
  );
};
