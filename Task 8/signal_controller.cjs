const jayson = require("jayson");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const ManualController = require("./manual.cjs");

const client = jayson.Client.http({
  port: 3000,
});

let STATUS1 = { p12: "RED", p34: "GREEN", s12: "GREEN", s34: "RED" };
let STATUS2 = { p12: "RED", p34: "GREEN", s12: "GREEN", s34: "RED" };
let STATUS3 = { p12: "RED", p34: "GREEN", s12: "GREEN", s34: "RED" };

let STATUS = [STATUS1, STATUS2, STATUS3];

// ✅ Function to update all STATUS objects together
function updateAllStatus(key, value) {
  for (let i = 0; i < STATUS.length; i++) {
    STATUS[i][key] = value;
  }
}

const GetSignal = (num) => {
  if (num === 1 || num === 2) {
    return [1, 2];
  } else if (num === 3 || num === 4) {
    return [3, 4];
  }
};

function PedestrianController(signal) {
  if (signal === 1) {
    updateAllStatus("p12", "RED");
    updateAllStatus("p34", "GREEN");
    console.log("Pedestrian signal for road 1 and 2 is RED");
    console.log("Pedestrian signal for road 3 and 4 is GREEN");
  } else if (signal === 3) {
    updateAllStatus("p12", "GREEN");
    updateAllStatus("p34", "RED");
    console.log("Pedestrian signal for road 1 and 2 is GREEN");
    console.log("Pedestrian signal for road 3 and 4 is RED");
  }
}

async function sleep(ms) {
  return await new Promise((resolve) => {
    console.log("Yellow light for 2 seconds...", STATUS);
    setTimeout(resolve, ms);
  });
}

async function signalController() {
  client.request("manipulator", [], async function (err, response) {
    if (err) throw err;
    console.log("Response from manipulator:", response.result);

    const [signal1] = GetSignal(response.result);

    if (signal1 === 1) {
      if (STATUS[0]["s12"] === "GREEN") {
        console.log("No changes required, signal 1 and 2 are already GREEN");
        updateAllStatus("s34", "RED");
        PedestrianController(signal1);
        console.log("Current Status:", STATUS);
        console.log();
      } else if (STATUS[0]["s12"] === "RED") {
        console.log("Changing signal for road 1 and 2 to GREEN");
        updateAllStatus("s12", "YELLOW");
        await sleep(2000);
        updateAllStatus("s12", "GREEN");
        updateAllStatus("s34", "RED");
        PedestrianController(signal1);
        console.log("Current Status:", STATUS);
        console.log();
      }
    } else if (signal1 === 3) {
      if (STATUS[0]["s34"] === "GREEN") {
        console.log("No changes required, signal 3 and 4 are already GREEN");
        updateAllStatus("s12", "RED");
        PedestrianController(signal1);
        console.log("Current Status:", STATUS);
        console.log();
      } else if (STATUS[0]["s34"] === "RED") {
        console.log("Changing signal for road 3 and 4 to GREEN");
        updateAllStatus("s34", "YELLOW");
        await sleep(2000);
        updateAllStatus("s34", "GREEN");
        updateAllStatus("s12", "RED");
        PedestrianController(signal1);
        console.log("Current Status:", STATUS);
        console.log();
      }
    }
  });
}

rl.question(
  "1. Automatic Mode\n2. Manual Mode\n3. Exit\nChoose Your Mode: ",
  function (mode) {
    if (
      mode !== "1" &&
      mode !== "2" &&
      mode !== "3" &&
      mode !== "4" &&
      mode !== "exit"
    ) {
      console.log("Invalid Mode. Please choose 1, 2 or 3");
    } else if (mode === "1") {
      setInterval(signalController, 5000);
    } else if (mode === "2") {
      rl.question(
        "Enter the road number (1-4) which needs to be GREEN: ",
        function (road) {
          if (road !== "1" && road !== "2" && road !== "3" && road !== "4") {
            console.log("Invalid road number. Please choose between 1 to 4");
          } else {
            const road_num = parseInt(road);
            ManualController(road_num, STATUS, sleep, PedestrianController);
            rl.close();
          }
        }
      );
    } else if (mode.toLowerCase() === "exit") {
      rl.close();
      process.exit(0);
    }
  }
);
