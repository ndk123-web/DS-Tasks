import ndk_load_balancer from "ndk-rpc-cluster/loadBalancer";

// Traffic service state simulated under load balancer
const makeService = () => {
  const STATUS = { s12: "GREEN", s34: "RED", p12: "RED", p34: "GREEN" };
  const GREEN_MS = 8000; const YELLOW_MS = 2000;
  let loopRunning = false;
  let AUTO = true;
  let servedCounter = 0; // to visualize load balancing in UI
  const nextServed = () => { servedCounter = (servedCounter % 3) + 1; return servedCounter; };
  const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));

  const get_status = () => ({ result: { ...STATUS, auto: AUTO, servedBy: nextServed() }, message: 'success' });
  const signal_controller = async () => ({ result: { ...STATUS, auto: AUTO, servedBy: nextServed() }, message: 'success' });
  const signal_manipulator = () => (STATUS.s12 === 'GREEN' || STATUS.s12 === 'YELLOW' ? 3 : 1);
  const pedestrian_controller = ({ road }) => ({ result: { ok: true, road, servedBy: nextServed() }, message: 'noop' });

  const selectRoad = (road) => (road === 1 || road === 2 ? [1,2] : [3,4]);

  const manual = async ({ roadToGreen, auto }) => {
    if (typeof auto === 'boolean') AUTO = auto;
    if (AUTO) return { result: { ...STATUS, auto: AUTO, servedBy: nextServed() }, message: 'auto-mode' };
    const [road] = selectRoad(parseInt(roadToGreen));
    if (road === 1){
      if (STATUS.s12 !== 'GREEN'){
        STATUS.s12='YELLOW'; await sleep(YELLOW_MS);
        STATUS.s12='GREEN'; STATUS.s34='RED';
      }
      STATUS.p12='RED'; STATUS.p34='GREEN';
    } else if (road === 3){
      if (STATUS.s34 !== 'GREEN'){
        STATUS.s34='YELLOW'; await sleep(YELLOW_MS);
        STATUS.s34='GREEN'; STATUS.s12='RED';
      }
      STATUS.p12='GREEN'; STATUS.p34='RED';
    }
    return { result: { ...STATUS, auto: AUTO, servedBy: nextServed() }, message: 'manual-updated' };
  };

  const startLoop = async()=>{
    if(loopRunning) return; loopRunning=true;
    // eslint-disable-next-line no-constant-condition
    while(true){
      if (!AUTO) { await sleep(200); continue; }
      // Road 12 GREEN
      STATUS.s12='GREEN'; STATUS.s34='RED'; STATUS.p12='RED'; STATUS.p34='GREEN';
      await sleep(GREEN_MS);
      STATUS.s12='YELLOW'; await sleep(YELLOW_MS);
      // Road 34 GREEN
      STATUS.s12='RED'; STATUS.s34='GREEN'; STATUS.p12='GREEN'; STATUS.p34='RED';
      await sleep(GREEN_MS);
      STATUS.s34='YELLOW'; await sleep(YELLOW_MS);
    }
  }

  startLoop();
  return { get_status, signal_controller, signal_manipulator, pedestrian_controller, manual };
}

const svc = makeService();

const register_functions = [
  { function_name: 'get_status', function_block: svc.get_status },
  { function_name: 'signal_controller', function_block: svc.signal_controller },
  { function_name: 'signal_manipulator', function_block: svc.signal_manipulator },
  { function_name: 'pedestrian_controller', function_block: svc.pedestrian_controller },
  { function_name: 'manual', function_block: svc.manual },
];

;(async () => {
  const lb = new ndk_load_balancer({ port: 3000, replicas: 3, register_functions });
  await lb.start();
  console.log("LB started at http://localhost:3000 (run-rpc-method available)");
})();
