/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { Awaitable } from "@sapphire/utilities";

export interface KirishimaOptions {
    clientId?: string;
    clientName?: string;
    nodes: KirishimaNodeOptions[];
    resumeSession?: boolean;
    resumeTimeout?: number;
    reconnectOnDisconnect?: boolean;
    reconnectInterval?: number;
    reconnectAttempts?: number;
    retriveSessionInfo?: RetriveSessionHook;
    saveSessionInfo?: SaveSessionHook;
}

export type RetriveSessionHook = (node: string) => Awaitable<string | null>;

export type SaveSessionHook = (node: string, sessionId: string) => Awaitable<unknown>;

export interface KirishimaNodeOptions {
    identifier?: string;
    url: string;
    secure?: boolean;
    password?: string;
    group?: string[];
}

