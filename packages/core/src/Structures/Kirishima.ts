/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { EventEmitter } from "node:events";
import { KirishimaNodeOptions, KirishimaOptions } from "../typings/index.js";
import crypto from "node:crypto";

import { KirishimaNode } from "./Node.js";
import { GatewayVoiceServerUpdateDispatch, GatewayVoiceStateUpdateDispatch } from "discord-api-types/gateway/v9";
import { Collection } from "@discordjs/collection";
import { PlayerOptions } from "@kirishima/types";
import { BasePlayer } from "./BasePlayer.js";

export class Kirishima extends EventEmitter {
    public nodes = new Collection<string, KirishimaNode>();
    public players?: Collection<string, BasePlayer>;
    public constructor(public options: KirishimaOptions) {
        super();

        if (typeof options.send !== "function") throw Error("Send function must be present and must be a function.");

        if (
            typeof options.spawnPlayer !== "function" ||
            (typeof options.spawnPlayer === "undefined" && (typeof options.fetchPlayer !== "function" || typeof options.fetchPlayer === "undefined"))
        ) {
            this.players = new Collection();
            options.spawnPlayer = this.defaultSpawnPlayerHandler.bind(this);
        }

        if (
            typeof options.fetchPlayer !== "function" ||
            (typeof options.fetchPlayer === "undefined" && (typeof options.spawnPlayer !== "function" || typeof options.spawnPlayer === "undefined"))
        ) {
            options.fetchPlayer = this.defaultFetchPlayerHandler.bind(this);
        }

        if (!options.nodes.length) throw new Error("Nodes option must not a empty array");
    }

    public async initialize(clientId?: string): Promise<Kirishima> {
        if (!clientId && !this.options.clientId) throw new Error("Invalid clientId provided");
        if (clientId && !this.options.clientId) this.options.clientId = clientId;
        return this.setNodes(this.options.nodes);
    }

    public async setNodes(nodeOrNodes: KirishimaNodeOptions | KirishimaNodeOptions[]): Promise<Kirishima> {
        const isArray = Array.isArray(nodeOrNodes);
        if (isArray) {
            for (const node of nodeOrNodes) {
                const kirishimaNode = new KirishimaNode(node, this);
                await kirishimaNode.connect();
                this.nodes.set(node.identifier ??= crypto.randomBytes(4).toString("hex"), kirishimaNode);
            }
            return this;
        }
        const kirishimaNode = new KirishimaNode(nodeOrNodes, this);
        await kirishimaNode.connect();
        this.nodes.set(nodeOrNodes.identifier ??= crypto.randomBytes(4).toString("hex"), kirishimaNode);
        return this;
    }

    public setClientName(clientName: string): this {
        this.options.clientName = clientName;
        return this;
    }

    public setClientId(clientId: string): this {
        this.options.clientId = clientId;
        return this;
    }

    public resolveNode(identifierOrGroup?: string): KirishimaNode | undefined {
        const resolveGroupedNode = this.nodes.filter(x => x.connected).find(x => x.options.group?.includes(identifierOrGroup!)!);
        if (resolveGroupedNode) return resolveGroupedNode;
        const resolveIdenfitierNode = this.nodes.filter(x => x.connected).find(x => x.options.identifier === identifierOrGroup);
        if (resolveIdenfitierNode) return resolveIdenfitierNode;
        return this.resolveBestNode().first();
    }

    public resolveBestNode(): Collection<string, KirishimaNode> {
        return this.nodes
            .filter(x => x.connected)
            .sort((x, y) => {
                const XLoad = x.stats?.cpu ? (x.stats.cpu.systemLoad / x.stats.cpu.cores) * 100 : 0;
                const YLoad = y.stats?.cpu ? (y.stats.cpu.systemLoad / y.stats.cpu.cores) * 100 : 0;
                return XLoad - YLoad;
            });
    }

    public spawnPlayer(options: PlayerOptions, node?: KirishimaNode): unknown {
        return this.options.spawnPlayer!(options.guildId, options, node ?? this.resolveNode()!);
    }

    public async handleVoiceServerUpdate(packet: GatewayVoiceServerUpdateDispatch): Promise<void> {
        for (const node of [...this.nodes.values()]) {
            await node.handleVoiceServerUpdate(packet);
        }
    }

    public async handleVoiceStateUpdate(packet: GatewayVoiceStateUpdateDispatch): Promise<void> {
        for (const node of [...this.nodes.values()]) {
            await node.handleVoiceStateUpdate(packet);
        }
    }

    public async handleRawPacket(t: "VOICE_SERVER_UPDATE" | "VOICE_STATE_UPDATE", packet: unknown): Promise<void> {
        if (t === "VOICE_STATE_UPDATE") {
            await this.handleVoiceStateUpdate(packet as GatewayVoiceStateUpdateDispatch);
        }
        if (t === "VOICE_SERVER_UPDATE") {
            await this.handleVoiceServerUpdate(packet as GatewayVoiceServerUpdateDispatch);
        }
    }

    private defaultSpawnPlayerHandler(guildId: string, options: PlayerOptions, node: KirishimaNode): BasePlayer {
        const player = this.players!.has(guildId);
        if (player) return this.players!.get(guildId)!;
        const kirishimaPlayer = new BasePlayer(options, this, node);
        this.players!.set(guildId, kirishimaPlayer);
        return kirishimaPlayer;
    }

    private defaultFetchPlayerHandler(guildId: string): BasePlayer | undefined {
        return this.players!.get(guildId);
    }
}
