import GlobalRegister from "ndk-rpc-cluster/registry";

;(async () => {
  const global = new GlobalRegister({ createMiddleware: true });
  await global.registerKeys({
    AddService: { host: "localhost", port: 3000 },
  });
  await global.start();
})();
