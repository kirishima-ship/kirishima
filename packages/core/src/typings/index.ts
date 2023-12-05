import { Awaitable } from "@sapphire/utilities";
import { GatewayOpcodes } from "discord-api-types/gateway/v9";
import { KirishimaNode } from "../Structures/Node.js";
import { KirishimaPlayer } from "../Structures/Player.js";
import { KirishimaPartialTrack } from "../Structures/PartialTrack.js";
import { KirishimaFilter } from "../Structures/Filter.js";
import { KirishimaPlugin } from "../Structures/Plugin.js";
import { Exception, LoadTypeEnum } from "lavalink-api-types";
import { Track } from "lavalink-api-types/v4"

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
    send: (options: KirishimaPlayerOptions, payload: payload) => Awaitable<unknown>;
    /** @description customize-able spawn-player handler, allow you to set it to collection or even redis. */
    spawnPlayer?: SpawnPlayerOptionHook;
    /** @description Used for getting global player, most likely used when `VOICE_SERVER_UPDATE` and `VOICE_SERVER_UPDATE` emits. note: you must provide same major method when customizing player handler. */
    fetchPlayer?: PlayerOptionHook;
    plugins?: KirishimaPlugin[];
}

export type SpawnPlayerOptionHook = (guildId: string, options: KirishimaPlayerOptions, node: KirishimaNode) => Awaitable<unknown>;

export type PlayerOptionHook = (guildId: string) => Awaitable<unknown | undefined>;
export interface payload {
    op: GatewayOpcodes;
    d: {
        guild_id: string;
        channel_id: string | null;
        self_deaf: boolean;
        self_mute: boolean;
    };
}

export interface KirishimaPlayerOptions {
    guildId: string;
    shardId?: number;
    channelId: string;
    textChannelId?: string;
    selfDeaf?: boolean;
    selfMute?: boolean;
}

export interface KirishimaNodeOptions {
    identifier?: string;
    url: string;
    secure?: boolean;
    password?: string;
    group?: string[];
}

export interface Extendable {
    KirishimaNode: typeof KirishimaNode;
    KirishimaPlayer: typeof KirishimaPlayer;
    KirishimaFilter: typeof KirishimaFilter;
}
