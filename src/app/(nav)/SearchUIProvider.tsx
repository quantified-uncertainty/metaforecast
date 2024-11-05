"use client";

import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useReducer,
} from 'react';

export const SearchUIContext = createContext<{
  showId: boolean;
  dispatch: Dispatch<SetStateAction<boolean>>;
}>({
  showId: false,
  dispatch: () => {},
});

export const SearchUIProvider: FC<PropsWithChildren> = ({ children }) => {
  const [showId, dispatch] = useReducer((showId: boolean) => !showId, false);

  return (
    <SearchUIContext.Provider value={{ showId, dispatch }}>
      {children}
    </SearchUIContext.Provider>
  );
};
