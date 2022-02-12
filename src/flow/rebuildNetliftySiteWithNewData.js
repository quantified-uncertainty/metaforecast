import axios from "axios"
import { getSecret, applyIfSecretExists } from "../utils/getSecrets.js"

export async function rebuildNetlifySiteWithNewData_inner(cookie) {
    let payload = ({});
    let response = await axios.post(cookie, payload);
    let data = response.data;
    console.log(data);
}

export async function rebuildNetlifySiteWithNewData() {
    let cookie = process.env.REBUIDNETLIFYHOOKURL || getSecret("netlify");
    await applyIfSecretExists(cookie, rebuildNetlifySiteWithNewData_inner)
}