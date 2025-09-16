import ndk_load_balancer from "ndk-rpc-cluster/loadBalancer";

// Traffic service state per replica
const makeService = () => {
  const STATUS = { s12: "GREEN", s34: "RED", p12: "RED", p34: "GREEN" };
  const GREEN_MS = 8000; const YELLOW_MS = 2000;
  let loopRunning = false;
  const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));

  const get_status = () => ({ result: { ...STATUS }, message: 'success' });
  const signal_controller = async () => ({ result: { ...STATUS }, message: 'success' });
  const signal_manipulator = () => (STATUS.s12 === 'GREEN' || STATUS.s12 === 'YELLOW' ? 3 : 1);
  const pedestrian_controller = ({ road }) => ({ result: { ok: true, road }, message: 'noop' });

  const startLoop = async()=>{
    if(loopRunning) return; loopRunning=true;
    // eslint-disable-next-line no-constant-condition
    while(true){
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
  return { get_status, signal_controller, signal_manipulator, pedestrian_controller };
}

const svc = makeService();

const register_functions = [
  { function_name: 'get_status', function_block: svc.get_status },
  { function_name: 'signal_controller', function_block: svc.signal_controller },
  { function_name: 'signal_manipulator', function_block: svc.signal_manipulator },
  { function_name: 'pedestrian_controller', function_block: svc.pedestrian_controller },
];

const lb = new ndk_load_balancer({ port: 4000, replicas: 3, register_functions });
await lb.start();
