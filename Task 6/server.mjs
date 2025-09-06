import ndk_rpc_server from "ndk-rpc-engine/server";

const server = new ndk_rpc_server({ port: 3000 });

const STATUS = {
  s12: "RED",
  s34: "GREEN",
  p12: "GREEN",
  p34: "RED",
};

// Two separate locks for deadlock demo
let SIGNAL_LOCK = false;
let PEDESTRIAN_LOCK = false;

const acquireSignalLock = async () => {
  while (SIGNAL_LOCK) await new Promise(r => setTimeout(r, 50));
  SIGNAL_LOCK = true;
};

const releaseSignalLock = () => {
  SIGNAL_LOCK = false;
};

const acquirePedestrianLock = async () => {
  while (PEDESTRIAN_LOCK) await new Promise(r => setTimeout(r, 50));
  PEDESTRIAN_LOCK = true;
};

const releasePedestrianLock = () => {
  PEDESTRIAN_LOCK = false;
};

const sleep = async (ms) => new Promise(r => setTimeout(r, ms));

const selectRoad = (road) => (road === 1 || road === 2 ? [1, 2] : [3, 4]);

// Signal controller
const signal_controller = async () => {
  console.log("SIGNAL CONTROLLER TRYING TO ACQUIRE SIGNAL_LOCK");
  await acquireSignalLock();
  console.log("SIGNAL CONTROLLER ACQUIRED SIGNAL_LOCK");

  await sleep(500);

  console.log("SIGNAL CONTROLLER TRYING TO ACQUIRE PEDESTRIAN_LOCK");
  await acquirePedestrianLock();
  console.log("SIGNAL CONTROLLER ACQUIRED PEDESTRIAN_LOCK");

  const road = selectRoad(Math.floor(Math.random() * 4 + 1))[0];

  if (road === 1) {
    STATUS.s12 = "GREEN";
    STATUS.s34 = "RED";
  } else {
    STATUS.s12 = "RED";
    STATUS.s34 = "GREEN";
  }

  console.log("STATUS AFTER SIGNAL CONTROLLER:", STATUS);

  releasePedestrianLock();
  releaseSignalLock();

  return { ...STATUS, roadToGreen: road };
};

// Pedestrian controller
const pedestrian_controller = async ({ road }) => {
  console.log("PEDESTRIAN CONTROLLER TRYING TO ACQUIRE SIGNAL_LOCK");
  await acquireSignalLock();
  console.log("PEDESTRIAN CONTROLLER ACQUIRED SIGNAL_LOCK");

  await sleep(500);
  console.log("PEDESTRIAN CONTROLLER TRYING TO ACQUIRE PEDESTRIAN_LOCK");
  await acquirePedestrianLock();
  console.log("PEDESTRIAN CONTROLLER ACQUIRED PEDESTRIAN_LOCK");

  // Set pedestrian signals based on road
  if (road === 1 || road === 2) {
    STATUS.p12 = "GREEN";
    STATUS.p34 = "RED";
  } else {
    STATUS.p12 = "RED";
    STATUS.p34 = "GREEN";
  }

  console.log("STATUS AFTER PEDESTRIAN CONTROLLER:", STATUS);

  releaseSignalLock();
  releasePedestrianLock();

  return STATUS;
};

// Random function
const signal_manipulator = () => Math.floor(Math.random() * 4 + 1);

// Register RPC functions
await server.register_functions([
  { function_name: "signal_controller", function_block: signal_controller },
  { function_name: "pedestrian_controller", function_block: pedestrian_controller },
  { function_name: "signal_manipulator", function_block: signal_manipulator },
]);

await server.start();
console.log("Server started on port 3000. Deadlock demo ready.");
