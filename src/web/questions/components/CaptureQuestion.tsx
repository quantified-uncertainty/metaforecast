import domtoimage from "dom-to-image"; // https://github.com/tsayen/dom-to-image
import { Resizable } from "re-resizable";
import { useEffect, useRef, useState } from "react";

import { Button } from "../../common/Button";
import { CopyParagraph } from "../../common/CopyParagraph";
import { QuestionFragment } from "../../fragments.generated";
import { uploadToImgur } from "../../worker/uploadToImgur";
import { QuestionCard } from "./QuestionCard";

const domToImageWrapper = async (node: HTMLDivElement) => {
  const scale = 3; // Increase for better quality
  const style = {
    transform: "scale(" + scale + ")",
    transformOrigin: "top left",
    width: node.offsetWidth + "px",
    height: node.offsetHeight + "px",
  };
  const param = {
    height: node.offsetHeight * scale,
    width: node.offsetWidth * scale,
    quality: 1,
    style,
  };
  const image = await domtoimage.toPng(node, param);
  return image;
};

const ImageSource: React.FC<{ question: QuestionFragment; imgSrc: string }> = ({
  question,
  imgSrc,
}) => {
  if (!imgSrc) {
    return null;
  }

  const html = `<a href="${question.url}" target="_blank"><img src="${imgSrc}" alt="Metaforecast.org snapshot of ''${question.title}'', from ${question.platform.label}"></a>`;
  const markdown = `[![](${imgSrc})](${question.url})`;

  return (
    <div className="space-y-4">
      <CopyParagraph text={markdown} buttonText="Copy markdown" />
      <CopyParagraph text={html} buttonText="Copy HTML" />
    </div>
  );
};

const generateMetaculusIframeURL = (question: QuestionFragment) => {
  let parts = question.url.replace("questions", "questions/embed").split("/");
  parts.pop();
  parts.pop();
  const iframeURL = parts.join("/");
  return iframeURL;
};

const generateMetaculusIframeHTML = (question: QuestionFragment) => {
  const iframeURL = generateMetaculusIframeURL(question);
  return `<iframe src="${iframeURL}" height="400" width="600"/>`;
};

const MetaculusEmbed: React.FC<{ question: QuestionFragment }> = ({
  question,
}) => {
  if (question.platform.id !== "metaculus") return null;

  const iframeURL = generateMetaculusIframeURL(question);
  return <iframe className="w-full h-80" src={iframeURL} />;
};

const MetaculusSource: React.FC<{
  question: QuestionFragment;
}> = ({ question }) => {
  if (question.platform.id !== "metaculus") return null;

  return (
    <CopyParagraph
      text={generateMetaculusIframeHTML(question)}
      buttonText="Copy HTML"
    />
  );
};

interface Props {
  question: QuestionFragment;
}

export const CaptureQuestion: React.FC<Props> = ({ question }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    setImgSrc(null);
  }, [question]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const initialMainButtonText = "Capture image and generate code";
  const [mainButtonText, setMainButtonText] = useState(initialMainButtonText);

  const exportAsPictureAndCode = async () => {
    if (!containerRef.current) {
      return;
    }
    try {
      const dataUrl = await domToImageWrapper(containerRef.current);
      const imgurUrl = await uploadToImgur(dataUrl);
      setImgSrc(imgurUrl);
      setMainButtonText("Done!");
      setTimeout(async () => {
        setMainButtonText(initialMainButtonText);
      }, 2000);
    } catch (error) {
      console.error("oops, something went wrong!", error);
    }
  };

  const onCaptureButtonClick = async () => {
    setMainButtonText("Processing...");
    setImgSrc(null);
    await exportAsPictureAndCode();
  };

  if (imgSrc) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div>
          <img src={imgSrc} />
        </div>
        <div>
          <ImageSource question={question} imgSrc={imgSrc} />
        </div>
        <div className="justify-self-stretch">
          <MetaculusEmbed question={question} />
        </div>
        <div>
          <MetaculusSource question={question} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Resizable
        minWidth={320}
        bounds="parent"
        enable={{ right: true, left: true }}
      >
        <div ref={containerRef}>
          <QuestionCard
            question={question}
            showTimeStamp={true}
            showExpandButton={false}
            expandFooterToFullWidth={true}
          />
        </div>
      </Resizable>
      <div>
        <Button onClick={onCaptureButtonClick}>{mainButtonText}</Button>
      </div>
    </div>
  );
};

// Note: https://stackoverflow.com/questions/66016033/can-no-longer-upload-images-to-imgur-from-localhost
// Use: http://imgurtester:3000/embed for testing.
