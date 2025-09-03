const { sign } = require('crypto');
const { STATUS_CODES } = require('http');
const jayson = require('jayson');

const client = jayson.Client.http({
    port: 3000
});

STATUS = {
    p12: "RED",
    p34: "GREEN",
    s12: "GREEN",
    s34: "RED"
}

const GetSignal = (num) => {
    if (num === 1 || num === 2){
        return [1,2]
    }
    else if (num ===3 || num ===4){
        return [3,4]
    }
}

function PedestrianController(signal){
    if (signal === 1){
        STATUS['p12'] = "RED";
        STATUS['p34'] = "GREEN";
        console.log("Pedestrian signal for road 1 and 2 is RED");
        console.log("Pedestrian signal for road 3 and 4 is GREEN");
    }
}

async function sleep(ms){
    return await new Promise((resolve) => {
        console.log("Yellow light for 2 seconds...", STATUS);
        setTimeout(resolve, ms);
    });
}

async function signalController() {
    
    client.request('manipulator', [], async function (err, response) {
        if (err) throw err;
        console.log("Response from manipulator:", response.result);

        const [signal1] = GetSignal(response.result);

        // means we need to green signal for 1 and 2 road
        if (signal1 === 1) {
            if (STATUS['s12'] === 'GREEN'){
                // no issues
                console.log("No changes required, signal 1 and 2 are already GREEN");
                STATUS['s34'] = "RED";
                PedestrianController(signal1);
                console.log("Current Status:", STATUS);
                console.log()
            }
            else if (STATUS['s12'] === "RED" ){
                // chanege the signal
                console.log("Changing signal for road 1 and 2 to GREEN");
                STATUS['s12'] = "YELLOW";
                await sleep(2000);
                STATUS['s12'] = "GREEN";
                STATUS['s34'] = "RED";
                PedestrianController(signal1);
                console.log("Current Status:", STATUS);
                console.log()
            }
        }

        else if (signal1 === 3) {
            if (STATUS['s34'] === 'GREEN'){
                // no issues
                console.log("No changes required, signal 3 and 4 are already GREEN");
                STATUS['s12'] = "RED";
                PedestrianController(signal1);
                console.log("Current Status:", STATUS);
                console.log()
            }
            else if (STATUS['s34'] === "RED" ){
                // change the signal
                console.log("Changing signal for road 3 and 4 to GREEN");
                STATUS['s34'] = "YELLOW";
                await sleep(2000);
                STATUS['s34'] = "GREEN";
                STATUS['s12'] = "RED";
                PedestrianController(signal1);
                console.log("Current Status:", STATUS);
                console.log()
            }
        }
    });
}

setInterval(signalController, 5000);
