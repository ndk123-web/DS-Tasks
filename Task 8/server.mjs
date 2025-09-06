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

const REPLICAS = [STATUS, STATUS, STATUS]

const updateReplicas = async ({ type, road, value }) => {
  let signalType = type === 'SIGNAL' ? 'SIGNAL' : 'PEDESTRIAN'

  console.log("Updating REPLICAS for ", signalType, "Road: ", road, "Value: ", value)

  for (let i = 0; i < REPLICAS.length; i++) {
    REPLICAS[i][road] = value
  }

  console.log("Done with Updating Replicas of ", signalType, "Road: ", road, "Value: ", value)
  console.log("CURRENT REPLICAS: ", REPLICAS)
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
  console.log("Road to Green: ", road, " ", road + 1)

  if (road === 1) {
    if (STATUS.s12 === "GREEN") {
      console.log("No Worries")
      STATUS.s34 = "RED"

      updateReplicas({ type: 'SIGNAL', road: 's34', value: "RED" })

      pedestrian_controller({ road: roadToGreen })
      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
    else {
      STATUS.s12 = "YELLOW"
      updateReplicas({ type: "SIGNAL", road: "s12", value: "YELLOW" })
      await sleep(2000)

      STATUS.s12 = "GREEN"
      updateReplicas({ type: "SIGNAL", road: "s12", value: "GREEN" })

      STATUS.s34 = "RED"
      updateReplicas({ type: "SIGNAL", road: "s34", value: "RED" })

      pedestrian_controller({ road: roadToGreen })
      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
  }

  else if (road === 3) {
    if (STATUS.s34 === "GREEN") {
      console.log("No Worries")

      STATUS.s12 = "RED"
      updateReplicas({ type: "SIGNAL", road: "s12", value: "RED" })

      pedestrian_controller({ road: roadToGreen })
      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
    else {
      STATUS.s34 = "YELLOW"
      updateReplicas({ type: "SIGNAL", road: "s34", value: "YELLOW" })
      await sleep(2000)

      STATUS.s34 = "GREEN"
      updateReplicas({ type: "SIGNAL", road: "s34", value: "GREEN" })
      STATUS.s12 = "RED"
      updateReplicas({ type: "SIGNAL", road: "s12", value: "RED" })

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
      updateReplicas({ type: 'SIGNAL', road: 's34', value: "RED" })

      pedestrian_controller({ road: road })
      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
    else {
      STATUS.s12 = "YELLOW"
      updateReplicas({ type: 'SIGNAL', road: 's12', value: "YELLOW" })

      await sleep(2000)

      STATUS.s12 = "GREEN"
      updateReplicas({ type: 'SIGNAL', road: 's12', value: "GREEN" })

      STATUS.s34 = "RED"
      updateReplicas({ type: 'SIGNAL', road: 's34', value: "RED" })

      pedestrian_controller({ road: road })
      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
  }

  else if (road === 3) {
    if (STATUS.s34 === "GREEN") {
      console.log("No Worries")

      STATUS.s12 = "RED"
      updateReplicas({ type: 'SIGNAL', road: 's12', value: "RED" })

      STATUS.p12 = "GREEN"
      updateReplicas({ type: 'PEDESTRIAN', road: 'p12', value: "GREEN" })

      STATUS.p34 = "RED"
      updateReplicas({ type: 'PEDESTRIAN', road: 'p34', value: "RED" })

      console.log("STATUS: ", STATUS)
      await sleep(2000)
    }
    else {
      STATUS.s34 = "YELLOW"
      updateReplicas({ type: 'SIGNAL', road: 's34', value: "YELLOW" })

      await sleep(2000)

      STATUS.s34 = "GREEN"
      updateReplicas({ type: 'SIGNAL', road: 's34', value: "GREEN" })

      STATUS.s12 = "RED"
      updateReplicas({ type: 'SIGNAL', road: 's12', value: "RED" })

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

    updateReplicas({ type: "PEDESTRIAN", road: 'p12', value: "GREEN" })
    updateReplicas({ type: "PEDESTRIAN", road: 'p34', value: "RED" })
  }
  else if (road === 3) {
    STATUS.p12 = "RED"
    STATUS.p34 = "GREEN"

    updateReplicas({ type: "PEDESTRIAN", road: 'p12', value: "RED" })
    updateReplicas({ type: "PEDESTRIAN", road: 'p34', value: "GREEN" })
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