export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Date serialized as the Unix timestamp. */
  Date: any;
};

export type CreateDashboardInput = {
  creator?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  ids: Array<Scalars['ID']>;
  title: Scalars['String'];
};

export type CreateDashboardResult = {
  __typename?: 'CreateDashboardResult';
  dashboard: Dashboard;
};

export type Dashboard = {
  __typename?: 'Dashboard';
  creator: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['ID'];
  questions: Array<Question>;
  title: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createDashboard: CreateDashboardResult;
};


export type MutationCreateDashboardArgs = {
  input: CreateDashboardInput;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

/** Platform supported by metaforecast */
export type Platform = {
  __typename?: 'Platform';
  id: Scalars['ID'];
  label: Scalars['String'];
};

export type ProbabilityOption = {
  __typename?: 'ProbabilityOption';
  name?: Maybe<Scalars['String']>;
  probability?: Maybe<Scalars['Float']>;
};

/** Various indicators of the question's quality */
export type QualityIndicators = {
  __typename?: 'QualityIndicators';
  numForecasts?: Maybe<Scalars['Int']>;
  stars: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  dashboard: Dashboard;
  frontpage: Array<Question>;
  questions: QueryQuestionsConnection;
  searchQuestions: Array<Question>;
};


export type QueryDashboardArgs = {
  id: Scalars['ID'];
};


export type QueryQuestionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QuerySearchQuestionsArgs = {
  input: SearchInput;
};

export type QueryQuestionsConnection = {
  __typename?: 'QueryQuestionsConnection';
  edges: Array<Maybe<QueryQuestionsConnectionEdge>>;
  pageInfo: PageInfo;
};

export type QueryQuestionsConnectionEdge = {
  __typename?: 'QueryQuestionsConnectionEdge';
  cursor: Scalars['String'];
  node: Question;
};

export type Question = {
  __typename?: 'Question';
  description: Scalars['String'];
  id: Scalars['ID'];
  options: Array<ProbabilityOption>;
  platform: Platform;
  qualityIndicators: QualityIndicators;
  timestamp: Scalars['Date'];
  title: Scalars['String'];
  url: Scalars['String'];
  visualization?: Maybe<Scalars['String']>;
};

export type SearchInput = {
  forecastingPlatforms?: InputMaybe<Array<Scalars['String']>>;
  forecastsThreshold?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  query: Scalars['String'];
  starsThreshold?: InputMaybe<Scalars['Int']>;
};
