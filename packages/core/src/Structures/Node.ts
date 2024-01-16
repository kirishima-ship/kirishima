/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { WebSocket } from "ws";
import { Gateway } from "@kirishima/ws";
import { REST } from "@kirishima/rest";
import { KirishimaNodeOptions } from "../typings/index.js";
import { Kirishima } from "./Kirishima.js";
import { GatewayVoiceServerUpdateDispatch, GatewayVoiceStateUpdateDispatch } from "discord-api-types/gateway/v9";
import { Collection } from "@discordjs/collection";
import { Snowflake } from "discord-api-types/globals";
import { Routes, StatsPayload, WebSocketOp } from "lavalink-api-types/v4";
import { Result } from "@sapphire/result";

export class KirishimaNode {
    public ws!: Gateway;
    public rest!: REST;
    public stats: StatsPayload | undefined;
    public sessionId: string | null = null;
    public reconnect: { attempts: number; timeout?: NodeJS.Timeout } = { attempts: 0 };
    public voiceServers = new Collection<Snowflake, GatewayVoiceServerUpdateDispatch["d"]>();
    public voiceStates = new Collection<Snowflake, GatewayVoiceStateUpdateDispatch["d"]>();

    public constructor(public options: KirishimaNodeOptions, public kirishima: Kirishima) {
        this.rest = new REST(`${this.options.url.endsWith("443") || this.options.secure ? "https" : "http"}://${this.options.url}`, {
            Authorization: this.options.password ??= "youshallnotpass"
        });

        this.ws = new Gateway(`${this.options.url.endsWith("443") || this.options.secure ? "wss" : "ws"}://${this.options.url}/v4/websocket`)
            .setAuthorization(this.options.password ?? "youshallnotpass")
            .setClientId(this.kirishima.clientId!)
            .setClientName(this.kirishima.clientName ?? "Kirishima-Ship/1.0.0");
    }

    public get connected(): boolean {
        return this.ws?.connection?.readyState === WebSocket.OPEN;
    }

    public async connect(): Promise<KirishimaNode> {
        if (this.connected) return this;

        if ("retriveSessionInfo" in this.kirishima.options && this.kirishima.options.retriveSessionInfo && this.options.identifier) {
            this.sessionId = await this.kirishima.options.retriveSessionInfo(this.options.identifier);
        }

        if ((this.kirishima.options.resumeSession ?? true) && this.sessionId) this.ws.setSessionId(this.sessionId);

        await this.ws.connect();
        this.ws.on("open", gateway => this.open(gateway));
        this.ws.on("message", (gateway, raw) => this.message(gateway, raw as Record<string, unknown>));
        this.ws.on("error", (gateway, error) => this.error(gateway, error));
        this.ws.on("close", (gateway, code) => this.close(gateway, code));
        return this;
    }

    public disconnect(): void {
        this.ws.connection?.close(1000, "Disconnected by user");
        if (this.reconnect.timeout) clearTimeout(this.reconnect.timeout);
    }

    public open(gateway: Gateway): void {
        this.reconnect.attempts = 0;
        this.kirishima.emit("nodeConnect", this, gateway);
    }

    public close(gateway: Gateway, close: number): void {
        this.kirishima.emit("nodeDisconnect", this, gateway, close);
        if (this.kirishima.options.reconnectOnDisconnect) {
            if (this.reconnect.attempts < (this.kirishima.options.reconnectAttempts ?? 3)) {
                this.reconnect.attempts++;
                this.kirishima.emit("nodeReconnect", this, gateway, close);
                this.reconnect.timeout = setTimeout(() => Result.fromAsync(() => this.connect()), this.kirishima.options.reconnectInterval ?? 5000);
            } else {
                this.kirishima.emit("nodeReconnectFailed", this, gateway, close);
            }
        }
    }

    public error(gateway: Gateway, error: Error): void {
        this.kirishima.emit("nodeError", this, gateway, error);
    }

    public async message(gateway: Gateway, raw: Record<string, unknown>): Promise<void> {
        try {
            if (raw.op === WebSocketOp.Ready) {
                this.sessionId = raw.sessionId as string;
                if ("saveSessionInfo" in this.kirishima.options && this.kirishima.options.saveSessionInfo && this.options.identifier) {
                    await this.kirishima.options.saveSessionInfo(this.options.identifier, this.sessionId);
                    if (this.kirishima.options.resumeSession ?? true) {
                        await Result.fromAsync(() => this.rest.patch(Routes.session(this.sessionId!), {
                            body: JSON.stringify({
                                resuming: true,
                                timeout: this.kirishima.options.resumeTimeout ?? 30 * 1000
                            })
                        }));
                    }
                }
                this.kirishima.emit("nodeReady", this, gateway, raw);
            }
        } catch (e) {
            this.kirishima.emit("nodeError", this, gateway, e);
        }
    }
}
