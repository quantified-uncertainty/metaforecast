import { GetServerSideProps } from 'next';

import { getFrontpage } from '../../backend/frontpage';
import searchAccordingToQueryData from '../worker/searchAccordingToQueryData';
import { defaultNumDisplay, defaultQueryParameters, QueryParameters } from './commonDisplay';

/* Common code for / and /capture */

export interface Props {
  defaultResults: any;
  initialResults: any;
  initialQueryParameters: QueryParameters;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  let urlQuery = context.query;

  let initialQueryParameters: QueryParameters = {
    ...defaultQueryParameters,
    numDisplay: defaultNumDisplay,
    ...urlQuery, // FIXME - parse numerical fields
  };

  let defaultResults = await getFrontpage();

  const initialResults =
    !!initialQueryParameters &&
    initialQueryParameters.query != "" &&
    initialQueryParameters.query != undefined
      ? await searchAccordingToQueryData(initialQueryParameters)
      : defaultResults;

  return {
    props: {
      initialQueryParameters,
      initialResults,
      defaultResults,
    },
  };
};
