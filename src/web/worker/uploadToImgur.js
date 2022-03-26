// import fetch from "fetch"
import axios from "axios";

export async function uploadToImgur(dataURL, handleGettingImgurlImage) {
  let request = {
    method: "post",
    url: "https://api.imgur.com/3/image",
    headers: {
      Authorization: "Bearer 8e9666fb889318515a62208560d4e8393dac26d8",
    },
    data: {
      type: "base64",
      image: dataURL.split(",")[1],
    },
    redirect: "follow",
  };
  let url;
  try {
    let response = await axios(request).then((response) => response.data);
    // console.log(dataURL)
    // console.log(response)
    url = `https://i.imgur.com/${response.data.id}.png`;
  } catch (error) {
    console.log("error", error);
  }
  let errorImageURL = "https://i.imgur.com/qcThRRz.gif"; // Error image
  url = url || errorImageURL;
  handleGettingImgurlImage(url);
}
