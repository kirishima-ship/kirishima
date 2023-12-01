import { AsyncQueue } from "@sapphire/async-queue";
import EventEmitter from "node:events";
import { IncomingMessage } from "node:http";
import { WebSocket } from "ws";

export interface Gateway {
    on: ((event: "message", listener: (gateway: Gateway, raw: unknown) => void) => this) & ((event: "open", listener: (gateway: Gateway) => void) => this) & ((event: "close", listener: (gateway: Gateway, code: number) => void) => this) & ((event: "error", listener: (gateway: Gateway, error: Error) => void) => this);
    once: ((event: "message", listener: (gateway: Gateway, raw: unknown) => void) => this) & ((event: "open", listener: (gateway: Gateway) => void) => this) & ((event: "close", listener: (gateway: Gateway, code: number) => void) => this) & ((event: "error", listener: (gateway: Gateway, error: Error) => void) => this) & ((event: "upgrade", listener: (gateway: Gateway, msg: IncomingMessage) => void) => this);
}

export class Gateway extends EventEmitter {
    public connection: WebSocket | undefined;
    public queue = new AsyncQueue();
    public headers: Record<string, string> = {};

    public get connnected(): boolean {
        return this.connection?.readyState === WebSocket.OPEN;
    }

    public constructor(private readonly url: string, headers?: Record<string, string>) {
        super();
        if (headers) this.headers = headers;
    }

    public setClientId(userId: string): this {
        this.headers["User-Id"] ??= userId;
        return this;
    }

    public setAuthorization(authorization: string): this {
        this.headers["Authorization"] ??= authorization;
        return this;
    }

    public setClientName(clientName: string): this {
        this.headers["Client-Name"] ??= clientName;
        return this;
    }

    public setResumeKey(key: string): this {
        this.headers["Resume-Key"] ??= key;
        return this;
    }

    public async connect(): Promise<this> {
        return new Promise(resolve => {
            this.connection = new WebSocket(this.url, { headers: this.headers });
            this.connection.on("message", raw => this.emit("message", this, JSON.parse(raw.toString())));
            this.connection.on("open", () => this.emit("open", this));
            this.connection.on("close", code => this.emit("close", this, code));
            this.connection.on("error", error => this.emit("error", this, error));
            this.connection.on("upgrade", res => this.emit("upgrade", this, res));
            return resolve(this);
        });
    }

    public async send<T>(message: T): Promise<this> {
        if (!this.connnected || !this.connection) new Error("Websocket connection are not estabilished yet.");
        await this.queue.wait();
        try {
            this.connection?.send(JSON.stringify(message));
            return this;
        } finally {
            this.queue.shift();
        }
    }
}
