/* eslint-disable id-length */
/* eslint-disable no-return-assign */
import type { PlayerOptions, ShardPayload } from "@kirishima/types";
import { GatewayOpcodes } from "discord-api-types/v10";

export function shardPayload(options: PlayerOptions, leave?: boolean): ShardPayload {
    return {
        op: GatewayOpcodes.VoiceStateUpdate,
        d: {
            guild_id: options.guildId,
            channel_id: leave ?? false ? null : options.voiceChannelId,
            self_deaf: options.selfDeaf ??= false,
            self_mute: options.selfMute ??= false
        }
    };
}
