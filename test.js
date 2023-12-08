import { Kirishima } from "@kirishima/core";

const client = new Kirishima({
    nodes: [
        {
            url: "192.168.210.141:2333",
            password: "youshallnotpass",
        }
    ],
    send: () => {

    }
});

await client.initialize("725331428962992131");

// client.on("nodeConnect", (node) => console.log(node));
// client.on("nodeDisconnect", (node) => console.log(node));

setTimeout(() => console.log(client.nodes), 2000)