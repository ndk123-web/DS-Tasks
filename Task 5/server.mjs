import ndk_rpc_server from "ndk-rpc-engine/server";

// Create RPC server
const server = new ndk_rpc_server({ port: 3000 });

// Shared traffic + pedestrian state
const STATUS = {
  s12: "GREEN", // start with Road 12 green
  s34: "RED",
  p12: "RED",   // pedestrians opposite the green road
  p34: "GREEN",
};

// Mutex (mutual exclusion) for state transitions
let LOCK = false;
const acquireLock = async () => {
  while (LOCK) {
    // short wait to avoid tight spin
    await new Promise((r) => setTimeout(r, 10));
  }
  LOCK = true;
};
const releaseLock = () => {
  LOCK = false;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Public RPC: get current status (Task 2/3 compatible shape)
const get_current_status = () => ({ result: { ...STATUS }, message: "success" });

// Assignment API compatibility
const signal_controller = async () => ({ result: { ...STATUS }, message: "success" });
const signal_manipulator = () => (STATUS.s12 === "GREEN" || STATUS.s12 === "YELLOW" ? 3 : 1);
const pedestrian_controller = ({ road }) => ({ result: { ok: true, road }, message: "noop" });

// Deterministic sequencer like Task 2: Road 12 -> yellow -> Road 34 -> yellow -> repeat
const GREEN_MS = 8000; // 8s green
const YELLOW_MS = 2000; // 2s yellow

let loopRunning = false;
const startSignalLoop = async () => {
  if (loopRunning) return;
  loopRunning = true;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Phase A: Road 12 GREEN, Road 34 RED, pedestrians follow opposite
    await acquireLock();
    STATUS.s12 = "GREEN";
    STATUS.s34 = "RED";
    STATUS.p12 = "RED"; // cars on road 12 moving, ped 12 should wait
    STATUS.p34 = "GREEN"; // road 34 is red for cars, ped 34 can go
    releaseLock();
    await sleep(GREEN_MS);

    // Transition: Road 12 YELLOW, Road 34 remains RED, pedestrians unchanged
    await acquireLock();
    STATUS.s12 = "YELLOW";
    STATUS.s34 = "RED";
    releaseLock();
    await sleep(YELLOW_MS);

    // Phase B: Road 34 GREEN, Road 12 RED, pedestrians flip
    await acquireLock();
    STATUS.s12 = "RED";
    STATUS.s34 = "GREEN";
    STATUS.p12 = "GREEN";
    STATUS.p34 = "RED";
    releaseLock();
    await sleep(GREEN_MS);

    // Transition: Road 34 YELLOW, Road 12 remains RED
    await acquireLock();
    STATUS.s34 = "YELLOW";
    STATUS.s12 = "RED";
    releaseLock();
    await sleep(YELLOW_MS);
  }
};

await server.register_functions([
  {
    function_name: "get_current_status",
    function_block: get_current_status,
  },
  { function_name: "signal_controller", function_block: signal_controller },
  { function_name: "signal_manipulator", function_block: signal_manipulator },
  { function_name: "pedestrian_controller", function_block: pedestrian_controller },
]);

await server.start();
startSignalLoop();
console.log("Task 5 Traffic Controller running with mutual exclusion on port 3000");