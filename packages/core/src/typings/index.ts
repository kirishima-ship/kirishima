import { Awaitable } from "@sapphire/utilities";
import { KirishimaNode } from "../Structures/Node.js";
import { PlayerOptions, ShardPayload } from "@kirishima/types";
import { BasePlayer } from "src/index.js";

export interface KirishimaOptions {
    clientId?: string;
    clientName?: string;
    nodes: KirishimaNodeOptions[];
    node?: {
        resumeKey?: string;
        resumeTimeout?: number;
        reconnectOnDisconnect?: boolean;
        reconnectInterval?: number;
        reconnectAttempts?: number;
    };
    send: (options: PlayerOptions, payload: ShardPayload) => Awaitable<unknown>;
    spawnPlayer?: SpawnPlayerOptionHook;
    fetchPlayer?: PlayerOptionHook;
}

export type SpawnPlayerOptionHook = (guildId: string, options: PlayerOptions, node: KirishimaNode) => Awaitable<unknown>;

export type PlayerOptionHook = (guildId: string) => Awaitable<BasePlayer>;

export interface KirishimaNodeOptions {
    identifier?: string;
    url: string;
    secure?: boolean;
    password?: string;
    group?: string[];
}

