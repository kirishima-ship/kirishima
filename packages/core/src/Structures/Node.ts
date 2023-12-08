/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { WebSocket } from "ws";
import { Gateway } from "@kirishima/ws";
import { REST } from "@kirishima/rest";
import { KirishimaNodeOptions } from "../typings/index.js";
import { Kirishima } from "./Kirishima.js";
import { GatewayVoiceServerUpdateDispatch, GatewayVoiceStateUpdateDispatch } from "discord-api-types/gateway/v9";
import { Collection } from "@discordjs/collection";
import { Snowflake } from "discord-api-types/globals";
import { StatsPayload, WebSocketOp } from "lavalink-api-types/v4";
import { BasePlayer } from "./BasePlayer.js";

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
    }

    public get connected(): boolean {
        return this.ws?.connection?.readyState === WebSocket.OPEN;
    }

    public async connect(): Promise<KirishimaNode> {
        if (this.connected) return this;
        const headers = {
            Authorization: this.options.password ??= "youshallnotpass",
            "User-Id": this.kirishima.options.clientId!,
            "Client-Name": this.kirishima.options.clientName ??= "Kirishima NodeJS Lavalink Client (https://github.com/kirishima-ship/core)"
        };

        this.ws = new Gateway(`${this.options.url.endsWith("443") || this.options.secure ? "wss" : "ws"}://${this.options.url}/v4/websocket`, headers);
        await this.ws.connect();
        this.ws.on("open", gateway => this.open(gateway));
        this.ws.on("message", (gateway, raw) => this.message(gateway, raw as Record<string, unknown>));
        this.ws.on("error", () => this.error.bind(this));
        this.ws.on("close", () => this.close.bind(this));
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
        if (this.kirishima.options.node && this.kirishima.options.node.reconnectOnDisconnect) {
            if (this.reconnect.attempts < (this.kirishima.options.node.reconnectAttempts ?? 3)) {
                this.reconnect.attempts++;
                this.kirishima.emit("nodeReconnect", this, gateway, close);
                this.reconnect.timeout = setTimeout(() => {
                    void this.connect();
                }, this.kirishima.options.node.reconnectInterval ?? 5000);
            } else {
                this.kirishima.emit("nodeReconnectFailed", this, gateway, close);
            }
        }
    }

    public error(gateway: Gateway, error: Error): void {
        this.kirishima.emit("nodeError", this, gateway, error);
    }

    public message(gateway: Gateway, raw: Record<string, unknown>): void {
        try {
            console.log(raw);
            if (raw.op === WebSocketOp.Ready) {
                this.sessionId = raw.sessionId as string;
            }
        } catch (e) {
            this.kirishima.emit("nodeError", this, gateway, e);
        }
    }

    public async handleVoiceServerUpdate(packet: GatewayVoiceServerUpdateDispatch): Promise<void> {
        const player = await this.kirishima.options.fetchPlayer!(packet.d.guild_id) as unknown as BasePlayer | undefined;
        if (player) await player.setServerUpdate(packet);
    }

    public async handleVoiceStateUpdate(packet: GatewayVoiceStateUpdateDispatch): Promise<void> {
        const player = await this.kirishima.options.fetchPlayer!(packet.d.guild_id!) as unknown as BasePlayer | undefined;
        if (player) await player.setStateUpdate(packet);
    }
}
