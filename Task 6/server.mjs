import ndk_rpc_server from "ndk-rpc-engine/server";

const server = new ndk_rpc_server({ port: 3006 });

// Shared state
const STATUS = {
  s12: "GREEN",
  s34: "RED",
  p12: "RED",
  p34: "GREEN",
};

// Two locks to illustrate deadlock concept (we expose their status to UI)
let SIGNAL_LOCK = false;
let PEDESTRIAN_LOCK = false;
let DEADLOCK = false;
let SIGNAL_OWNER = null; // 'cars' or 'peds'
let PED_OWNER = null;    // 'cars' or 'peds'

const acquireSignalLock = async (owner) => {
  while (SIGNAL_LOCK) await new Promise((r) => setTimeout(r, 5));
  SIGNAL_LOCK = true;
  SIGNAL_OWNER = owner;
};
const releaseSignalLock = () => {
  SIGNAL_LOCK = false;
  SIGNAL_OWNER = null;
};
const acquirePedestrianLock = async (owner) => {
  while (PEDESTRIAN_LOCK) await new Promise((r) => setTimeout(r, 5));
  PEDESTRIAN_LOCK = true;
  PED_OWNER = owner;
};
const releasePedestrianLock = () => {
  PEDESTRIAN_LOCK = false;
  PED_OWNER = null;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Deterministic controller loop like Task 2 (no randomness)
const GREEN_MS = 8000;
const YELLOW_MS = 2000;
let loopRunning = false;
const startLoop = async () => {
  if (loopRunning) return;
  loopRunning = true;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Phase A: acquire both locks (signal -> pedestrian) and HOLD during the phase
  await acquireSignalLock('cars');
  await acquirePedestrianLock('cars');
    STATUS.s12 = "GREEN"; STATUS.s34 = "RED";
    STATUS.p12 = "RED";   STATUS.p34 = "GREEN";
  DEADLOCK = SIGNAL_LOCK && PEDESTRIAN_LOCK; // both held -> risky state
    await sleep(GREEN_MS);

    // YELLOW for s12, still holding locks
    STATUS.s12 = "YELLOW";
    await sleep(YELLOW_MS);
    // release for switch
    releasePedestrianLock();
    releaseSignalLock();

    // Phase B: acquire in reverse order (pedestrian -> signal) and HOLD
  await acquirePedestrianLock('peds');
  await acquireSignalLock('peds');
    STATUS.s12 = "RED";   STATUS.s34 = "GREEN";
    STATUS.p12 = "GREEN"; STATUS.p34 = "RED";
    DEADLOCK = SIGNAL_LOCK && PEDESTRIAN_LOCK;
    await sleep(GREEN_MS);

    // YELLOW for s34, still holding locks
    STATUS.s34 = "YELLOW";
    await sleep(YELLOW_MS);
    // release to end cycle
    releaseSignalLock();
    releasePedestrianLock();
  }
};

// Keep exactly three RPCs
// 1) signal_controller: return status for UI (no side effects)
const signal_controller = async () => {
  return {
    result: {
      ...STATUS,
      locks: { signal: SIGNAL_LOCK, pedestrian: PEDESTRIAN_LOCK, owners: { signal: SIGNAL_OWNER, pedestrian: PED_OWNER } },
      deadlock: DEADLOCK,
    },
    message: "success",
  };
};

// 2) pedestrian_controller: provided to satisfy assignment (no-op here)
const pedestrian_controller = async ({ road }) => {
  // no-op to keep API; could extend to manual pedestrian toggles
  return { result: { ok: true, road }, message: "noop" };
};

// 3) signal_manipulator: provided to satisfy assignment (returns next logical road)
const signal_manipulator = () => {
  // return 1 or 3 based on which road would be next green
  return STATUS.s12 === "GREEN" || STATUS.s12 === "YELLOW" ? 3 : 1;
};

await server.register_functions([
  { function_name: "signal_controller", function_block: signal_controller },
  { function_name: "pedestrian_controller", function_block: pedestrian_controller },
  { function_name: "signal_manipulator", function_block: signal_manipulator },
]);

await server.start();
startLoop();
console.log("Task 6 server started on port 3000 (Deadlock UI demo, deterministic)");
