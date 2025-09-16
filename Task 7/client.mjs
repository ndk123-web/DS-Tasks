import { Client } from "ndk-rpc-cluster/client";

const client = new Client();

const res = await client.request({
  method: "add",
  params: { a: 10, b: 20 },
  key: "AddService",
});

console.log(res);