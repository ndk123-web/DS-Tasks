import { Client } from "ndk-rpc-engine/client";
import readline from 'readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client = new Client({
    server_port: 3000
})

const main = async (count) => {
    if (count === 50) {
        console.log("Max Limit Reached !!")
        return;
    }
    rl.question("1. Automatic \n2. Manual \n3. Exit \n", async (selected) => {
        if (selected !== '1' && selected !== '2' && selected.toLowerCase() !== 'exit') {
            console.log("Invalid Selection ")
            main(count++) // recursion if invalid  
            return; // its mandatory or else down code also will executes
        }

        if (selected === '1') {
            setInterval(async () => {
                try {
                    const response = await client.request({
                        method: "signal_controller",
                        params: {}
                    });

                    console.log("Response:", response);
                    rl.close()
                } catch (err) {
                    console.error("Request failed:", err.message);
                }
            }, 5000);
        }

        else if (selected === "2") {
            rl.question("Enter Number To be Green the Road\n", async (road) => {
                if (road < 1 || road > 4) {
                    console.log("Invalid Road Choose from (1-4)")
                    main(count++);
                    return;
                }
                const response = await client.request({
                    method: 'manual',
                    params: {
                        roadToGreen: road
                    }
                })
                console.log("Response: ", response);
                rl.close()
            })
        }
        return; // not important but for ease just returning or else it automatically will be return
    })
}

main(0);