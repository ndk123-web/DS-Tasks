import ndk_rpc_server from "ndk-rpc-engine/server";

// Create RPC server
const server = new ndk_rpc_server({ port: 3000 });

// Traffic signal states for Road 12 and Road 34
const STATUS = {
  s12: "GREEN", // Start with Road 12 GREEN
  s34: "RED",
};

// Durations (ms)
const GREEN_MS = 8000; // 8 seconds green
const YELLOW_MS = 2000; // 2 seconds yellow

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Public RPC: get current status
const get_current_status = () => ({ result: { ...STATUS }, message: "success" });

// Background loop to alternate signals automatically
let loopRunning = false;
const startSignalLoop = async () => {
  if (loopRunning) return;
  loopRunning = true;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Phase: Road 12 GREEN, Road 34 RED
    STATUS.s12 = "GREEN";
    STATUS.s34 = "RED";
    await sleep(GREEN_MS);

    // Transition: Road 12 YELLOW, Road 34 remains RED
    STATUS.s12 = "YELLOW";
    STATUS.s34 = "RED";
    await sleep(YELLOW_MS);

    // Switch: Road 12 RED, Road 34 GREEN
    STATUS.s12 = "RED";
    STATUS.s34 = "GREEN";
    await sleep(GREEN_MS);

    // Transition: Road 34 YELLOW, Road 12 remains RED
    STATUS.s34 = "YELLOW";
    STATUS.s12 = "RED";
    await sleep(YELLOW_MS);
  }
};

// Register only the status function for clients
await server.register_functions([
  {
    function_name: "get_current_status",
    function_block: get_current_status,
  },
]);

await server.start();

// Start automatic controller loop
startSignalLoop();

// Minimal startup log
console.log("Traffic Controller Server running on port 3000");