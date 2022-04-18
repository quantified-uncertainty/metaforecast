import React, { DependencyList, EffectCallback, useEffect } from "react";

export const useNoInitialEffect = (
  effect: EffectCallback,
  deps: DependencyList
) => {
  const initial = React.useRef(true);
  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    return effect();
  }, deps);
};

export const useIsFirstRender = (): boolean => {
  const isFirst = React.useRef(true);

  if (isFirst.current) {
    isFirst.current = false;

    return true;
  }

  return isFirst.current;
};
