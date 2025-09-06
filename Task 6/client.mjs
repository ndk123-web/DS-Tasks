import { Client } from "ndk-rpc-engine/client";

const client = new Client({ server_port: 3000 });

// Call signal controller every 5 seconds
setInterval(async () => {
  try {
    const signalResponse = await client.request({ method: "signal_controller" });
    console.log("Signal Response:", signalResponse);

    // Call pedestrian controller based on the roadToGreen from signal controller
    const pedestrianResponse = await client.request({
      method: "pedestrian_controller",
      params: { road: signalResponse.roadToGreen },
    });
    console.log("Pedestrian Response:", pedestrianResponse);
  } catch (err) {
    console.error("Request failed:", err.message);
  }
}, 5000);
