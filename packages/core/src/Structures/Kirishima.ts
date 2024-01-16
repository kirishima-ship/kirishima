/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { EventEmitter } from "node:events";
import { KirishimaNodeOptions, KirishimaOptions } from "../typings/index.js";
import crypto from "node:crypto";

import { KirishimaNode } from "./Node.js";
import { Collection } from "@discordjs/collection";

export class Kirishima extends EventEmitter {
    public nodes = new Collection<string, KirishimaNode>();

    public constructor(public options: KirishimaOptions) {
        super();

        if (!options.nodes.length) throw new Error("Nodes option must not a empty array");
    }

    public get clientId() {
        return this.options.clientId;
    }

    public get clientName() {
        return this.options.clientName;
    }

    public get getNodeOptions() {
        return {
            resumeSession: this.options.resumeSession,
            resumeTimeout: this.options.resumeTimeout,
            reconnectOnDisconnect: this.options.reconnectOnDisconnect,
            reconnectInterval: this.options.reconnectInterval,
            reconnectAttempts: this.options.reconnectAttempts
        };
    }

    public async initialize(clientId?: string): Promise<Kirishima> {
        if (!clientId && !this.clientId) throw new Error("Invalid clientId provided");
        if (clientId && !this.clientId) this.options.clientId = clientId;
        return this.setNodes(this.options.nodes);
    }

    public async setNodes(nodeOrNodes: KirishimaNodeOptions | KirishimaNodeOptions[]): Promise<Kirishima> {
        const isArray = Array.isArray(nodeOrNodes);
        if (isArray) {
            for (const node of nodeOrNodes) {
                node.identifier ??= crypto.randomBytes(4).toString("hex");
                const kirishimaNode = new KirishimaNode(node, this);
                await kirishimaNode.connect();
                this.nodes.set(node.identifier, kirishimaNode);
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
}
