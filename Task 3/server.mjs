import ndk_rpc_server from "ndk-rpc-engine/server";

const server = new ndk_rpc_server({ port: 3000 });

// Traffic and pedestrian states
const STATUS = {
  s12: "GREEN", // start with Road 12 GREEN
  s34: "RED",
  p12: "RED",   // when s12 is GREEN, pedestrians 12 must be RED
  p34: "GREEN", // when s34 is RED, pedestrians 34 can be GREEN
};

// Durations (ms)
const GREEN_MS = 8000;
const YELLOW_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// keep pedestrians consistent with roads
const sync_pedestrians = () => {
  // If a road is GREEN or YELLOW, its pedestrian must be RED
  STATUS.p12 = STATUS.s12 === "RED" ? "GREEN" : "RED";
  STATUS.p34 = STATUS.s34 === "RED" ? "GREEN" : "RED";
};

// Public RPC: get current status
const get_current_status = () => ({ result: { ...STATUS }, message: "success" });

// Background deterministic loop
let loopRunning = false;
const startLoop = async () => {
  if (loopRunning) return;
  loopRunning = true;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Phase A: Road 12 GREEN, Road 34 RED
    STATUS.s12 = "GREEN";
    STATUS.s34 = "RED";
    sync_pedestrians();
    await sleep(GREEN_MS);

    // Transition A: Road 12 YELLOW, Road 34 remains RED
    STATUS.s12 = "YELLOW";
    STATUS.s34 = "RED";
    sync_pedestrians();
    await sleep(YELLOW_MS);

    // Phase B: Road 12 RED, Road 34 GREEN
    STATUS.s12 = "RED";
    STATUS.s34 = "GREEN";
    sync_pedestrians();
    await sleep(GREEN_MS);

    // Transition B: Road 34 YELLOW, Road 12 remains RED
    STATUS.s34 = "YELLOW";
    STATUS.s12 = "RED";
    sync_pedestrians();
    await sleep(YELLOW_MS);
  }
};

await server.register_functions([
  { function_name: "get_current_status", function_block: get_current_status },
]);

await server.start();
startLoop();
console.log("Task 3 Traffic Controller running on port 3000");