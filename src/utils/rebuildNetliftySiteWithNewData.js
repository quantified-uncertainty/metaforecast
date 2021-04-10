import axios from "axios"
import {getCookie, applyIfCookieExists} from "../utils/getCookies.js"

export async function rebuildNetlifySiteWithNewData_inner(cookie){
    let payload = ({});
    let response = await axios.post(cookie, payload);
    let data = response.data;
    console.log(data);
}

export async function rebuildNetlifySiteWithNewData(){
    let cookie = process.env.REBUIDNETLIFYHOOKURL || getCookie("netlify");
    await applyIfCookieExists(rebuildNetlifySiteWithNewData_inner, cookie)
}