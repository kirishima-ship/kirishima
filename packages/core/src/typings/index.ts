import { Awaitable } from '@sapphire/utilities';
import type { GatewayOpcodes } from 'discord-api-types/gateway/v9';
import type { KirishimaNode } from '../Structures/KirishimaNode.js';
import type { KirishimaPlayer } from '../Structures/KirishimaPlayer.js';
import type { KirishimaTrack } from '../Structures/Track/KirishimaTrack.js';
import type { KirishimaPartialTrack } from '../Structures/Track/KirishimaPartialTrack.js';
import { KirishimaFilter } from '../Structures/KirishimaFilter.js';
import { KirishimaPlugin } from '../Structures/KirishimaPlugin.js';
import { Exception, LoadTypeEnum } from 'lavalink-api-types';

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
    send(options: KirishimaPlayerOptions, payload: payload): Awaitable<unknown>;
    /** @description customize-able spawn-player handler, allow you to set it to collection or even redis. */
    spawnPlayer?: SpawnPlayerOptionHook;
    /** @description Used for getting global player, most likely used when `VOICE_SERVER_UPDATE` and `VOICE_SERVER_UPDATE` emits. note: you must provide same major method when customizing player handler. */
    fetchPlayer?: PlayerOptionHook;
    plugins?: KirishimaPlugin[];
}

export interface SpawnPlayerOptionHook {
    (guildId: string, options: KirishimaPlayerOptions, node: KirishimaNode): Awaitable<unknown>;
}

export interface PlayerOptionHook {
    (guildId: string): Awaitable<unknown | undefined>;
}
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
    KirishimaTrack: typeof KirishimaTrack;
    KirishimaPartialTrack: typeof KirishimaPartialTrack;
    KirishimaFilter: typeof KirishimaFilter;
}

export interface LoadTrackResponse {
    loadType: LoadTypeEnum;
    playlistInfo?: {
        name: string;
        selectedTrack: number;
    };
    tracks: (KirishimaTrack | KirishimaPartialTrack)[];
    exception?: Omit<Exception, 'cause'>;
}