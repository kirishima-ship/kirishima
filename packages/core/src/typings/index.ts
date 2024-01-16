/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { PlayerData, ShardPayload } from "@kirishima/types";
import { Awaitable } from "@sapphire/utilities";

export interface KirishimaOptions {
    clientId?: string;
    clientName?: string;

    /** Node Options */
    nodes: KirishimaNodeOptions[];
    resumeSession?: boolean;
    resumeTimeout?: number;
    reconnectOnDisconnect?: boolean;
    reconnectInterval?: number;
    reconnectAttempts?: number;

    /** Hooks */
    retriveSessionInfo?: RetriveSessionHook;
    saveSessionInfo?: SaveSessionHook;
    retrivePlayer: RetrivePlayerHook;
    savePlayer: SavePlayerHook;
    send: SendHook;
}

export type SendHook = (payload: ShardPayload) => Awaitable<unknown>;

export type RetrivePlayerHook = (clientId: string, guildId: string) => Awaitable<PlayerData | null>;

export type SavePlayerHook = (data: PlayerData) => Awaitable<void>;

export type RetriveSessionHook = (node: string) => Awaitable<string | null>;

export type SaveSessionHook = (node: string, sessionId: string) => Awaitable<void>;

export interface KirishimaNodeOptions {
    identifier?: string;
    url: string;
    secure?: boolean;
    password?: string;
    group?: string[];
}
