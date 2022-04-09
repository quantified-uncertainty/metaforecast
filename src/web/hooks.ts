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
