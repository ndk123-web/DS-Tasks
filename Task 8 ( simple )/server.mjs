import ndk_rpc_server from "ndk-rpc-engine/server";

const server = new ndk_rpc_server({
  port: 3000
})

const STATUS = {
  s12: "RED",
  s34: "GREEN",
  p12: "GREEN",
  p34: "RED"
}

const selectRoad = (road) => {
  if (road === 1 || road === 2) {
    return [1, 2]
  }
  else {
    return [3, 4]
  }
}

const sleep = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("STATUS: ", STATUS);
      resolve(); // yaha resolve karna zaroori hai
    }, ms);
  });
};

const manual = async ({ roadToGreen }) => {
  console.log("Before Manual Status: ", STATUS)
  console.log("Road To Be Green : ", roadToGreen);

  const [road] = selectRoad(parseInt(roadToGreen))
  console.log("Road to Green: ", road)

  if (road === 1) {
    if (STATUS.s12 === "GREEN") {
      console.log("No Worries")
      STATUS.s34 = "RED"
      pedestrian_controller({ road: roadToGreen })
      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
    else {
      STATUS.s12 = "YELLOW"
      await sleep(2000)
      STATUS.s12 = "GREEN"
      STATUS.s34 = "RED"
      pedestrian_controller({ road: roadToGreen })
      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
  }

  else if (road === 3) {
    if (STATUS.s34 === "GREEN") {
      console.log("No Worries")
      STATUS.s12 = "RED"
      pedestrian_controller({ road: roadToGreen })
      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
    else {
      STATUS.s34 = "YELLOW"
      await sleep(2000)
      STATUS.s34 = "GREEN"
      STATUS.s12 = "RED"

      pedestrian_controller({ road: roadToGreen })

      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
  }
  return { ...STATUS, roadToGreen: road }
};

const signal_controller = async () => {
  const randomRoad = signal_manipulator()
  console.log("Random Road : ", randomRoad)
  const [road] = selectRoad(randomRoad)

  if (road === 1) {
    if (STATUS.s12 === "GREEN") {
      console.log("No Worries")
      STATUS.s34 = "RED"
      STATUS.p34 = "GREEN"
      STATUS.p12 = "RED"
      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
    else {
      STATUS.s12 = "YELLOW"
      await sleep(2000)
      STATUS.s12 = "GREEN"
      STATUS.s34 = "RED"
      pedestrian_controller({ road: road })
      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
  }

  else if (road === 3) {
    if (STATUS.s34 === "GREEN") {
      console.log("No Worries")
      STATUS.s12 = "RED"
      STATUS.p12 = "GREEN"
      STATUS.p34 = "RED"
      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
    else {
      STATUS.s34 = "YELLOW"
      await sleep(2000)
      STATUS.s34 = "GREEN"
      STATUS.s12 = "RED"

      pedestrian_controller({ road: road })

      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
  }
  return { ...STATUS, roadToGreen: road }
}

// Generate Random Function 
const signal_manipulator = () => {
  const random = parseInt(Math.floor(Math.random() * 4) + 1)
  return random;
}

const pedestrian_controller = ({ road }) => {
  if (road === 1) {
    STATUS.p12 = "GREEN"
    STATUS.p34 = "RED"
  }
  else if (road === 3) {
    STATUS.p12 = "RED"
    STATUS.p34 = "GREEN"
  }
}


await server.register_functions([
  {
    function_name: "signal_controller",
    function_block: signal_controller
  },
  {
    function_name: "signal_manipulator",
    function_block: signal_manipulator
  },
  {
    function_name: "pedestrian_controller",
    function_block: pedestrian_controller
  },
  {
    function_name: "manual",
    function_block: manual
  }
])

await server.start();