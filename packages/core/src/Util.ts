import { GatewayOpcodes } from 'discord-api-types/gateway/v9';
import { KirishimaPartialTrack } from './Structures/Track/KirishimaPartialTrack.js';
import { KirishimaTrack } from './Structures/Track/KirishimaTrack.js';
import { KirishimaPlayerOptions } from './typings/index.js';

export function isPartialTrack(track: unknown): track is KirishimaPartialTrack {
    return track instanceof KirishimaPartialTrack;
}

export function isTrack(track: unknown): track is KirishimaTrack {
    return track instanceof KirishimaTrack;
}

export function createVoiceChannelJoinPayload(options: KirishimaPlayerOptions, leave?: boolean) {
    return {
        op: GatewayOpcodes.VoiceStateUpdate,
        d: {
            guild_id: options.guildId,
            channel_id: leave ? null : options.channelId,
            self_deaf: (options.selfDeaf ??= false),
            self_mute: (options.selfMute ??= false)
        }
    };
}