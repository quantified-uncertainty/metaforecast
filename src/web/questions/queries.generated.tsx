import * as Types from '../../graphql/types.generated';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { QuestionWithHistoryFragmentDoc } from '../fragments.generated';
export type QuestionPageQueryVariables = Types.Exact<{
  id: Types.Scalars['ID'];
}>;


export type QuestionPageQuery = { __typename?: 'Query', result?: { __typename?: 'Question', id: string, url: string, title: string, description: string, fetched: number, visualization?: string | null, history: Array<{ __typename?: 'History', fetched: number, options: Array<{ __typename?: 'ProbabilityOption', name?: string | null, probability?: number | null }> }>, options: Array<{ __typename?: 'ProbabilityOption', name?: string | null, probability?: number | null }>, platform: { __typename?: 'Platform', id: string, label: string }, qualityIndicators: { __typename?: 'QualityIndicators', stars: number, numForecasts?: number | null, numForecasters?: number | null, volume?: number | null, spread?: number | null, sharesVolume?: number | null, openInterest?: number | null, liquidity?: number | null, tradeVolume?: number | null } } | null };


export const QuestionPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"QuestionPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"result"},"name":{"kind":"Name","value":"question"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"QuestionWithHistory"}}]}}]}},...QuestionWithHistoryFragmentDoc.definitions]} as unknown as DocumentNode<QuestionPageQuery, QuestionPageQueryVariables>;