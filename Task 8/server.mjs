import ndk_rpc_server from "ndk-rpc-engine/server";

const server = new ndk_rpc_server({ port: 3008 });

const STATUS = { s12: "GREEN", s34: "RED", p12: "RED", p34: "GREEN" };
const REPLICAS = [STATUS, STATUS, STATUS];

let AUTO = true; // auto mode default
const GREEN_MS = 8000; const YELLOW_MS = 2000;
const sleep = (ms)=> new Promise(r=>setTimeout(r, ms));

const updateReplicas = async ({ type, road, value }) => {
  for (let i = 0; i < REPLICAS.length; i++) { REPLICAS[i][road] = value; }
};

const selectRoad = (road) => (road === 1 || road === 2 ? [1, 2] : [3, 4]);

// Auto sequencer (deterministic)
let loopRunning=false;
const startAutoLoop = async()=>{
  if(loopRunning) return; loopRunning=true;
  // eslint-disable-next-line no-constant-condition
  while(true){
    if(!AUTO){ await sleep(200); continue; }
    // Road 12 GREEN
    STATUS.s12 = "GREEN"; await updateReplicas({type:'SIGNAL', road:'s12', value:'GREEN'});
    STATUS.s34 = "RED";   await updateReplicas({type:'SIGNAL', road:'s34', value:'RED'});
    STATUS.p12 = "RED";   await updateReplicas({type:'PEDESTRIAN', road:'p12', value:'RED'});
    STATUS.p34 = "GREEN"; await updateReplicas({type:'PEDESTRIAN', road:'p34', value:'GREEN'});
    await sleep(GREEN_MS);
    // YELLOW
    STATUS.s12 = "YELLOW"; await updateReplicas({type:'SIGNAL', road:'s12', value:'YELLOW'});
    await sleep(YELLOW_MS);
    // Road 34 GREEN
    STATUS.s12 = "RED";    await updateReplicas({type:'SIGNAL', road:'s12', value:'RED'});
    STATUS.s34 = "GREEN";  await updateReplicas({type:'SIGNAL', road:'s34', value:'GREEN'});
    STATUS.p12 = "GREEN";  await updateReplicas({type:'PEDESTRIAN', road:'p12', value:'GREEN'});
    STATUS.p34 = "RED";    await updateReplicas({type:'PEDESTRIAN', road:'p34', value:'RED'});
    await sleep(GREEN_MS);
    // YELLOW
    STATUS.s34 = "YELLOW"; await updateReplicas({type:'SIGNAL', road:'s34', value:'YELLOW'});
    await sleep(YELLOW_MS);
  }
}

// Required functions
const signal_controller = async () => {
  // Return status + mode; used for polling UI
  return { result: { ...STATUS, auto: AUTO }, message: 'success' };
};

const signal_manipulator = () => {
  // Return next road that would be green if switching now
  return STATUS.s12 === 'GREEN' || STATUS.s12 === 'YELLOW' ? 3 : 1;
};

const pedestrian_controller = ({ road }) => {
  // Keep pedestrians opposite to green road
  if (road === 1) { STATUS.p12='RED'; STATUS.p34='GREEN'; }
  else if (road === 3) { STATUS.p12='GREEN'; STATUS.p34='RED'; }
};

const manual = async ({ roadToGreen, auto }) => {
  if (typeof auto === 'boolean') AUTO = auto;
  if (AUTO) return { result: { ...STATUS, auto: AUTO }, message: 'auto-mode' };
  const [road] = selectRoad(parseInt(roadToGreen));
  if (road === 1){
    if (STATUS.s12 !== 'GREEN'){
      STATUS.s12='YELLOW'; await updateReplicas({type:'SIGNAL', road:'s12', value:'YELLOW'}); await sleep(YELLOW_MS);
      STATUS.s12='GREEN';  await updateReplicas({type:'SIGNAL', road:'s12', value:'GREEN'});
      STATUS.s34='RED';    await updateReplicas({type:'SIGNAL', road:'s34', value:'RED'});
    }
    pedestrian_controller({ road: 1 });
  } else if (road === 3){
    if (STATUS.s34 !== 'GREEN'){
      STATUS.s34='YELLOW'; await updateReplicas({type:'SIGNAL', road:'s34', value:'YELLOW'}); await sleep(YELLOW_MS);
      STATUS.s34='GREEN';  await updateReplicas({type:'SIGNAL', road:'s34', value:'GREEN'});
      STATUS.s12='RED';    await updateReplicas({type:'SIGNAL', road:'s12', value:'RED'});
    }
    pedestrian_controller({ road: 3 });
  }
  return { result: { ...STATUS, auto: AUTO }, message: 'manual-updated' };
};

;(async () => {
  await server.register_functions([
    { function_name: 'signal_controller', function_block: signal_controller },
    { function_name: 'signal_manipulator', function_block: signal_manipulator },
    { function_name: 'pedestrian_controller', function_block: pedestrian_controller },
    { function_name: 'manual', function_block: manual },
  ]);
  await server.start();
  startAutoLoop();
})();