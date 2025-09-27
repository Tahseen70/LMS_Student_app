// app/index.js
import { decode, encode } from "base-64";

if (!global.btoa) {
  console.log(global.btoa);
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/auth/splash" />;
}
