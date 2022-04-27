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
  /** The creator of the dashboard, e.g. "Peter Parker" */
  creator?: InputMaybe<Scalars['String']>;
  /** The longer description of the dashboard */
  description?: InputMaybe<Scalars['String']>;
  /** List of question ids */
  ids: Array<Scalars['ID']>;
  /** The title of the dashboard */
  title: Scalars['String'];
};

export type CreateDashboardResult = {
  __typename?: 'CreateDashboardResult';
  dashboard: Dashboard;
};

export type Dashboard = {
  __typename?: 'Dashboard';
  /** The creator of the dashboard, e.g. "Peter Parker" */
  creator: Scalars['String'];
  /** The longer description of the dashboard */
  description: Scalars['String'];
  id: Scalars['ID'];
  /** The list of questions on the dashboard */
  questions: Array<Question>;
  /** The title of the dashboard */
  title: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Create a new dashboard; if the dashboard with given ids already exists then it will be returned instead. */
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

/** Forecasting platform supported by Metaforecast */
export type Platform = {
  __typename?: 'Platform';
  /** Short unique platform name, e.g. "xrisk" */
  id: Scalars['ID'];
  /** Platform name for displaying on frontend etc., e.g. "X-risk estimates" */
  label: Scalars['String'];
};

export type ProbabilityOption = {
  __typename?: 'ProbabilityOption';
  name?: Maybe<Scalars['String']>;
  /** 0 to 1 */
  probability?: Maybe<Scalars['Float']>;
};

/** Various indicators of the question's quality */
export type QualityIndicators = {
  __typename?: 'QualityIndicators';
  liquidity?: Maybe<Scalars['Float']>;
  numForecasters?: Maybe<Scalars['Int']>;
  numForecasts?: Maybe<Scalars['Int']>;
  openInterest?: Maybe<Scalars['Float']>;
  sharesVolume?: Maybe<Scalars['Float']>;
  spread?: Maybe<Scalars['Float']>;
  /** 0 to 5 */
  stars: Scalars['Int'];
  tradeVolume?: Maybe<Scalars['Float']>;
  volume?: Maybe<Scalars['Float']>;
};

export type Query = {
  __typename?: 'Query';
  /** Look up a single dashboard by its id */
  dashboard: Dashboard;
  /** Get a list of questions that are currently on the frontpage */
  frontpage: Array<Question>;
  /** Look up a single question by its id */
  question: Question;
  questions: QueryQuestionsConnection;
  /** Search for questions; uses Algolia instead of the primary metaforecast database */
  searchQuestions: Array<Question>;
};


export type QueryDashboardArgs = {
  id: Scalars['ID'];
};


export type QueryQuestionArgs = {
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
  /** Unique string which identifies the question */
  id: Scalars['ID'];
  options: Array<ProbabilityOption>;
  platform: Platform;
  qualityIndicators: QualityIndicators;
  /** Timestamp at which metaforecast fetched the question */
  timestamp: Scalars['Date'];
  title: Scalars['String'];
  /** Non-unique, a very small number of platforms have a page for more than one prediction */
  url: Scalars['String'];
  visualization?: Maybe<Scalars['String']>;
};

export type SearchInput = {
  /** List of platform ids to filter by */
  forecastingPlatforms?: InputMaybe<Array<Scalars['String']>>;
  /** Minimum number of forecasts on a question */
  forecastsThreshold?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
  query: Scalars['String'];
  /** Minimum number of stars on a question */
  starsThreshold?: InputMaybe<Scalars['Int']>;
};
