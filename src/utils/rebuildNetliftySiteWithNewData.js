import axios from "axios"

export async function rebuildNetlifySiteWithNewData(){
    let rebuildNetlifyHookUrl = process.env.REBUIDNETLIFYHOOKURL;
    let payload = ({});
    let response = await axios.post(rebuildNetlifyHookUrl, payload);
    let data = response.data;
    console.log(data);   
}