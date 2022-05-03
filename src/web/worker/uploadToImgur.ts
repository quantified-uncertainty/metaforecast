import axios, { AxiosRequestConfig } from "axios";

export async function uploadToImgur(dataURL: string): Promise<string> {
  const request: AxiosRequestConfig = {
    method: "post",
    url: "https://api.imgur.com/3/image",
    headers: {
      Authorization: "Bearer 8e9666fb889318515a62208560d4e8393dac26d8",
    },
    data: {
      type: "base64",
      image: dataURL.split(",")[1],
    },
  };

  let url = "https://i.imgur.com/qcThRRz.gif"; // Error image
  try {
    const response = await axios(request).then((response) => response.data);
    url = `https://i.imgur.com/${response.data.id}.png`;
  } catch (error) {
    console.log("error", error);
  }

  return url;
}
