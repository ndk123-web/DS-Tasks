    const {sleep} = require("./signal_controller.cjs");
    const {PedestrianController} = require("./signal_controller.cjs");

    const ManualController = async (signal,STATUS,sleep,PedestrianController) => {
    if (signal < 1 || signal > 4) {
        console.log("Invalid road number. Please choose between 1 to 4");
        return;
    }
    if (signal === 1) {
        if (STATUS["s12"] === "GREEN") {
        // no issues
        console.log("No changes required, signal 1 and 2 are already GREEN");
        STATUS["s34"] = "RED";
        PedestrianController(signal);
        console.log("Current Status:", STATUS);
        console.log();
        } else if (STATUS["s12"] === "RED") {
        // chanege the signal
        console.log("Changing signal for road 1 and 2 to GREEN");
        STATUS["s12"] = "YELLOW";
        await sleep(2000);
        STATUS["s12"] = "GREEN";
        STATUS["s34"] = "RED";
        PedestrianController(signal);
        console.log("Current Status:", STATUS);
        console.log();
        }
    } else if (signal === 3) {
        if (STATUS["s34"] === "GREEN") {
        // no issues
        console.log("No changes required, signal 3 and 4 are already GREEN");
        STATUS["s12"] = "RED";
        PedestrianController(signal);
        console.log("Current Status:", STATUS);
        console.log();
        } else if (STATUS["s34"] === "RED") {
        // change the signal
        console.log("Changing signal for road 3 and 4 to GREEN");
        STATUS["s34"] = "YELLOW";
        await sleep(2000);
        STATUS["s34"] = "GREEN";
        STATUS["s12"] = "RED";
        PedestrianController(signal);
        console.log("Current Status:", STATUS);
        console.log();
        }
    }
    };

    module.exports = ManualController;