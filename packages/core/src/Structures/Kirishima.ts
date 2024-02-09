/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import crypto from "node:crypto";
import { Collection } from "@discordjs/collection";
import type { Gateway } from "@kirishima/ws";
import { TypedEmitter } from "tiny-typed-emitter";
import type { KirishimaNodeOptions, KirishimaOptions } from "../typings/index.js";

import { KirishimaNode } from "./Node.js";
import { Player } from "./Player.js";

type KirishimaEvents = {
    nodeDisconnect(node: KirishimaNode, gateway: Gateway, code: number): void;
    nodeReconnect(node: KirishimaNode, gateway: Gateway, code: number): void;
    nodeReconnectFailed(node: KirishimaNode, gateway: Gateway, code: number): void;
    nodeError(node: KirishimaNode, gateway: Gateway, error: unknown): void;
    nodeReady(node: KirishimaNode, gateway: Gateway, message: unknown): void;
    nodeRaw(node: KirishimaNode, gateway: Gateway, message: unknown): void;
    nodeConnect(node: KirishimaNode, gateway: Gateway): void;
};

export class Kirishima extends TypedEmitter<KirishimaEvents> {
    public nodes = new Collection<string, KirishimaNode>();

    public constructor(public options: KirishimaOptions) {
        super();

        if (options.nodes.length === 0) throw new Error("Nodes option must not a empty array");
    }

    public get clientId(): string | undefined {
        return this.options.clientId;
    }

    public get clientName(): string | undefined {
        return this.options.clientName;
    }

    public async initialize(clientId?: string): Promise<Kirishima> {
        if ((clientId === undefined) && (this.clientId === undefined)) throw new Error("Invalid clientId provided");
        if (clientId === undefined && this.clientId === undefined) this.options.clientId = clientId;
        return this.setNodes(this.options.nodes);
    }

    public async setNodes(nodeOrNodes: KirishimaNodeOptions | KirishimaNodeOptions[]): Promise<Kirishima> {
        const isArray = Array.isArray(nodeOrNodes);
        if (isArray) {
            for (const node of nodeOrNodes) {
                node.identifier ??= crypto.randomBytes(4).toString("hex");
                const kNode = new KirishimaNode(node, this);
                await kNode.connect();
                this.nodes.set(node.identifier, kNode);
            }
            return this;
        }
        nodeOrNodes.identifier ??= crypto.randomBytes(4).toString("hex");
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

    public async resolvePlayer(clientId: string, guildId: string): Promise<Player | null> {
        const cache = await this.options.retrivePlayer(clientId, guildId);
        return cache ? new Player(cache, this) : null;
    }
}
