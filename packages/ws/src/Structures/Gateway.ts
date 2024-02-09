import type { IncomingMessage } from "node:http";
import { AsyncQueue } from "@sapphire/async-queue";
import { TypedEmitter } from "tiny-typed-emitter";
import { WebSocket } from "ws";

type GatewayEvents = {
    close(gateway: Gateway, code: number): void;
    error(gateway: Gateway, error: Error): void;
    message(gateway: Gateway, raw: unknown): void;
    open(gateway: Gateway): void;
    upgrade(gateway: Gateway, msg: IncomingMessage): void;
};

export class Gateway extends TypedEmitter<GatewayEvents> {
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
        this.headers["User-Id"] = userId;
        return this;
    }

    public setAuthorization(authorization: string): this {
        this.headers.Authorization = authorization;
        return this;
    }

    public setClientName(clientName: string): this {
        this.headers["Client-Name"] = clientName;
        return this;
    }

    public setSessionId(id: string): this {
        this.headers["Session-Id"] = id;
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
            resolve(this);
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
