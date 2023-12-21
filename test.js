import { Kirishima } from "@kirishima/core";

const client = new Kirishima({
    nodes: [
        {
            url: "192.168.234.141:2333",
            password: "youshallnotpass"
        }
    ],
    send: () => {

    },
    saveSessionInfo: (node, sessionId) => {
        console.log(node, sessionId);
    },
    retriveSessionInfo: () => {
        return "4gihbp2dcdaa8gwn";
    },
    reconnectOnDisconnect: true,
    reconnectInterval: 3000
});

client.on("nodeReady", (a, b, raw) => console.log(raw));

await client.initialize("725331428962992131");

// client.on("nodeConnect", (node) => console.log(node));
// client.on("nodeDisconnect", (node) => console.log(node));
