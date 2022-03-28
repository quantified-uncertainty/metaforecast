import domtoimage from "dom-to-image"; // https://github.com/tsayen/dom-to-image
import { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { uploadToImgur } from "../worker/uploadToImgur";
import { displayForecast } from "./displayForecasts";

function displayOneForecastInner(result, containerRef) {
  return (
    <div ref={containerRef}>
      {result
        ? displayForecast({
            ...result.item,
            score: result.score,
            showTimeStamp: true,
            expandFooterToFullWidth: true,
          })
        : null}
    </div>
  );
}

let domToImageWrapper = (reactRef) => {
  let node = reactRef.current;
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
  let image = domtoimage.toPng(node, param);
  return image;
};

let generateHtml = (result, imgSrc) => {
  let html = `<a href="${result.item.url} target="_blank""><img src="${imgSrc}" alt="Metaforecast.org snapshot of ''${result.item.title}'', from ${result.item.platform}"></a>`;
  return html;
};

let generateMarkdown = (result, imgSrc) => {
  let markdown = `[![](${imgSrc})](${result.item.url})`;
  return markdown;
};

let generateSource = (result, imgSrc, hasDisplayBeenCaptured) => {
  const [htmlButtonStatus, setHtmlButtonStatus] = useState("Copy HTML");
  const [markdownButtonStatus, setMarkdownButtonStatus] =
    useState("Copy markdown");
  let handleHtmlButton = () => {
    setHtmlButtonStatus("Copied");
    let newtimeoutId = setTimeout(async () => {
      setHtmlButtonStatus("Copy HTML");
    }, 2000);
  };
  let handleMarkdownButton = () => {
    setMarkdownButtonStatus("Copied");
    let newtimeoutId = setTimeout(async () => {
      setMarkdownButtonStatus("Copy markdown");
    }, 2000);
  };

  if (result && imgSrc && hasDisplayBeenCaptured) {
    return (
      <div className="grid">
        <p className="bg-gray-100 cursor-pointer px-3 py-2 rounded-md shadow text-grey-7000 font-mono text-sm">
          {generateMarkdown(result, imgSrc)}
        </p>
        <CopyToClipboard
          text={generateMarkdown(result, imgSrc)}
          onCopy={() => handleMarkdownButton()}
        >
          <button className="bg-blue-500 cursor-pointer px-3 py-2 rounded-md shadow text-white hover:bg-blue-600 active:scale-120">
            {markdownButtonStatus}
          </button>
        </CopyToClipboard>
        <p className="bg-gray-100 cursor-pointer px-3 py-2 rounded-md shadow text-grey-7000 font-mono text-sm">
          {generateHtml(result, imgSrc)}
        </p>
        <CopyToClipboard
          text={generateHtml(result, imgSrc)}
          onCopy={() => handleHtmlButton()}
        >
          <button className="bg-blue-500 cursor-pointer px-3 py-2 rounded-md shadow text-white mb-4 hover:bg-blue-600">
            {htmlButtonStatus}
          </button>
        </CopyToClipboard>
      </div>
    );
  } else {
    return null;
  }
};

let generateIframeURL = (result) => {
  let iframeURL = "";
  if (result) {
    // if check not strictly necessary today
    let parts = result.item.url
      .replace("questions", "questions/embed")
      .split("/");
    parts.pop();
    parts.pop();
    iframeURL = parts.join("/");
  }
  return iframeURL;
};

let metaculusEmbed = (result) => {
  let platform = "";
  let iframeURL = "";
  if (result) {
    iframeURL = generateIframeURL(result);
    platform = result.item.platform;
  }

  return (
    <iframe
      className={`${
        platform == "Metaculus" ? "" : "hidden"
      } flex h-80 w-full justify-self-center self-center`}
      src={iframeURL}
    />
  );
};

let generateMetaculusIframeHTML = (result) => {
  if (result) {
    let iframeURL = generateIframeURL(result);
    return `<iframe src="${iframeURL}" height="400" width="600"/>`;
  } else {
    return null;
  }
};

let generateMetaculusSource = (result, hasDisplayBeenCaptured) => {
  const [htmlButtonStatus, setHtmlButtonStatus] = useState("Copy HTML");
  let handleHtmlButton = () => {
    setHtmlButtonStatus("Copied");
    let newtimeoutId = setTimeout(async () => {
      setHtmlButtonStatus("Copy HTML");
    }, 2000);
  };

  if (result && hasDisplayBeenCaptured && result.item.platform == "Metaculus") {
    return (
      <div className="grid">
        <p className="bg-gray-100 cursor-pointer px-3 py-2 rounded-md shadow text-grey-7000 font-mono text-sm">
          {generateMetaculusIframeHTML(result)}
        </p>
        <CopyToClipboard
          text={generateMetaculusIframeHTML(result)}
          onCopy={() => handleHtmlButton()}
        >
          <button className="bg-blue-500 cursor-pointer px-3 py-2 rounded-md shadow text-white mb-4 hover:bg-blue-600">
            {htmlButtonStatus}
          </button>
        </CopyToClipboard>
      </div>
    );
  } else {
    return null;
  }
};

interface Props {
  result: any;
}

const DisplayOneForecast: React.FC<Props> = ({ result }) => {
  const [hasDisplayBeenCaptured, setHasDisplayBeenCaptured] = useState(false);

  useEffect(() => {
    setHasDisplayBeenCaptured(false);
  }, [result]);

  const containerRef = useRef(null);
  const [imgSrc, setImgSrc] = useState("");
  const [mainButtonStatus, setMainButtonStatus] = useState(
    "Capture image and generate code"
  );

  let exportAsPictureAndCode = () => {
    let handleGettingImgurlImage = (imgurUrl) => {
      setImgSrc(imgurUrl);
      setMainButtonStatus("Done!");
      let newtimeoutId = setTimeout(async () => {
        setMainButtonStatus("Capture image and generate code");
      }, 2000);
    };
    domToImageWrapper(containerRef)
      .then(async function (dataUrl) {
        if (dataUrl) {
          uploadToImgur(dataUrl, handleGettingImgurlImage);
        }
      })
      .catch(function (error) {
        console.error("oops, something went wrong!", error);
      });
  }; //

  let onCaptureButtonClick = () => {
    exportAsPictureAndCode();
    setMainButtonStatus("Processing...");
    setHasDisplayBeenCaptured(true);
    setImgSrc("");
  };

  function generateCaptureButton(result, onCaptureButtonClick) {
    if (result) {
      return (
        <button
          onClick={() => onCaptureButtonClick()}
          className="bg-blue-500 cursor-pointer px-5 py-4 rounded-md shadow text-white hover:bg-blue-600 active:bg-gray-700"
        >
          {mainButtonStatus}
        </button>
      );
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full justify-center">
      <div className="flex col-span-1 items-center justify-center">
        {displayOneForecastInner(result, containerRef)}
      </div>
      <div className="flex col-span-1 items-center justify-center">
        {generateCaptureButton(result, onCaptureButtonClick)}
      </div>
      <div className="flex col-span-1 items-center justify-center">
        <img src={imgSrc} className={hasDisplayBeenCaptured ? "" : "hidden"} />
      </div>
      <div className="flex col-span-1 items-center justify-center">
        <div>{generateSource(result, imgSrc, hasDisplayBeenCaptured)}</div>
      </div>
      <div className="flex col-span-1 items-center justify-center mb-8">
        {metaculusEmbed(result)}
      </div>
      <div className="flex col-span-1 items-center justify-center">
        <div>{generateMetaculusSource(result, hasDisplayBeenCaptured)}</div>
      </div>
      <br></br>
    </div>
  );
};

export default DisplayOneForecast;

// https://stackoverflow.com/questions/39501289/in-reactjs-how-to-copy-text-to-clipboard
// Note: https://stackoverflow.com/questions/66016033/can-no-longer-upload-images-to-imgur-from-localhost
// Use: http://imgurtester:3000/embed for testing.
