import { GetServerSideProps, NextPage } from "next";
import NextError from "next/error";

import { Query } from "../../common/Query";
import { ssrUrql } from "../../urql";
import { QuestionChartOrVisualization } from "../components/QuestionChartOrVisualization";
import { QuestionInfoRow } from "../components/QuestionInfoRow";
import { QuestionTitle } from "../components/QuestionTitle";
import { QuestionPageDocument } from "../queries.generated";

interface Props {
  id: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const [ssrCache, client] = ssrUrql();
  const id = context.query.id as string;

  const question =
    (await client.query(QuestionPageDocument, { id }).toPromise()).data
      ?.result || null;

  if (!question) {
    context.res.statusCode = 404;
  }

  return {
    props: {
      urqlState: ssrCache.extractData(),
      id,
      question
    },
  };
};

const EmbedQuestionPage: NextPage<Props> = ({ id }) => {
  return (
    <div className="block bg-white min-h-screen">
      <Query document={QuestionPageDocument} variables={{ id }}>
        {({ data: { result: question } }) =>
          question ? (
            <div className="flex flex-col p-2 w-full h-12/12">
              {/*<QuestionTitle question={question} linkToMetaforecast={true} /> */}

              <div className="mb-1 mt-1">
                <QuestionInfoRow question={question} />
              </div>

              <div className="mb-0">
                <QuestionChartOrVisualization question={question} />
              </div>
            </div>
          ) : (
            <NextError statusCode={404} />
          )
        }
      </Query>
    </div>
  );
};

export default EmbedQuestionPage;
