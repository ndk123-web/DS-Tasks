import GlobalRegister from "ndk-rpc-cluster/registry";

const global = new GlobalRegister({
  createMiddleware: true,
});

await global.registerKeys({
  AddService: {
    host: "localhost",
    port: 4000,
  },
});

await global.start();
