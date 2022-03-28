import axios from 'axios';

import { applyIfSecretExists } from '../utils/getSecrets';

async function rebuildNetlifySiteWithNewData_inner(cookie) {
  let payload = {};
  let response = await axios.post(cookie, payload);
  let data = response.data;
  console.log(data);
}

export async function rebuildNetlifySiteWithNewData() {
  let cookie = process.env.REBUIDNETLIFYHOOKURL;
  await applyIfSecretExists(cookie, rebuildNetlifySiteWithNewData_inner);
}
