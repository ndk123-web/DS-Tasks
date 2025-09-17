class Client {
    server_port = "";

    constructor({ server_port }) {
        this.server_port = server_port || 3000;
    }

    async request({ method, params }) {
        try {
            const server_response = await fetch(
                `http://localhost:${this.server_port}/api/v1/rpc/run-rpc-method`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ method_name: method, params }),
                }
            );
            if (server_response.status !== 200) {
                const errorData = await server_response.json();
                return { message: errorData.message };
            }
            const responseData = await server_response.json();
            let { data, message } = responseData;
            return { message, ...data };
        } catch (err) {
            return { message: "Something went wrong while making request to server" };
        }
    }
}

const client = new Client({ server_port: 3000 });

const signal12 = document.getElementById("signal12");
const signal34 = document.getElementById("signal34");
const ped12 = document.getElementById("ped12");
const ped34 = document.getElementById("ped34");

function updateSignal(element, state) {
    if (!element) return;
    element.className = `signal-light ${state.toLowerCase()}`;
    element.textContent = state;
}

const pollStatus = async () => {
    try {
        const response = await client.request({ method: "get_current_status", params: {} });

        if (response && response.result) {
                    const { s12, s34, p12, p34 } = response.result.result;
            updateSignal(signal12, s12);
            updateSignal(signal34, s34);
            updateSignal(ped12, p12);
            updateSignal(ped34, p34);
        }
    } catch (err) {
        // ignore transient errors
    }
};

setInterval(pollStatus, 1000);
pollStatus();