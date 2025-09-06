import { Client } from "ndk-rpc-engine/client";

const client = new Client({
    server_port: 3000
})

setInterval(async () => {
    try {
        const response = await client.request({
            method: "signal_controller",
            params: {}
        });

        console.log("Response:", response);
    } catch (err) {
        console.error("Request failed:", err.message);
    }
}, 5000);