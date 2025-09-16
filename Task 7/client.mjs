class Client {
  #middleServerPort = "";

  constructor() {
    this.#middleServerPort = 4132;
  }

  async request({ method, params, key }) {
    try {
      const server_response = await fetch(
        `http://localhost:${
          this.#middleServerPort
        }/api/v1/middleman/middleman-send-request-to-registry`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method, params, key }),
        }
      );

      const responseData = await server_response.json();

      if (server_response.ok) {
        // Normalize various possible shapes from middleware/LB
        const methodName =
          responseData?.data?.data?.method ||
          responseData?.data?.method ||
          responseData?.method;

        const normalizedResult =
          responseData?.data?.data?.result ??
          responseData?.data?.result ??
          responseData?.result ??
          responseData?.data ??
          null;

        return {
          message: responseData.message,
          method: methodName,
          result: normalizedResult,
        };
      } else {
        return {
          error:
            responseData.message?.message ||
            responseData.message ||
            "Unknown error",
        };
      }
    } catch (err) {
      return { error: "Something went wrong while making request to server" };
    }
  }
}

const client = new Client();

const el = (id) => document.getElementById(id);
const setLight = (node, state) => {
  if (!state) {
    node.className = "signal-light unknown";
    node.textContent = "Unknown";
    return;
  }
  node.className = `signal-light ${state.toLowerCase()}`;
  node.textContent = state.toUpperCase();
};

const poll = async () => {
  try {
    const resp = await client.request({
      method: "signal_controller",
      params: {},
      key: "AddService",
    });

    const payload = resp?.result?.result || {};
    const { s12, s34, p12, p34, auto, servedBy } = payload;

    setLight(el("signal12"), s12);
    setLight(el("signal34"), s34);
    setLight(el("ped12"), p12);
    setLight(el("ped34"), p34);

    if (auto !== undefined) {
      el("mode").value = auto ? "auto" : "manual";
      el("roadPick").disabled = !!auto;
      el("applyBtn").disabled = !!auto;
    }
    if (servedBy) el("served").textContent = `Served By: Replica ${servedBy}`;
  } catch (err) {
    console.error("Poll error:", err);
  }
};

setInterval(poll, 5000);
poll();

el("mode").addEventListener("change", async (e) => {
  const auto = e.target.value === "auto";
  const res = await client.request({
    method: "manual",
    params: { auto },
    key: "AddService",
  });
  console.log("Mode Change Response: ",res) ;
  await poll();
});

el("applyBtn").addEventListener("click", async () => {
  const roadToGreen = el("roadPick").value;
  const response = await client.request({
    method: "manual",
    params: { auto: false, roadToGreen },
    key: "AddService",
  });
  console.log("Manual Response: ",response) ;
  await poll();
});
