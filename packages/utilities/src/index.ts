import { GatewayOpcodes } from "discord-api-types/v10";
import { PlayerOptions } from "@kirishima/types";

export function createVoiceChannelJoinPayload(options: PlayerOptions, leave?: boolean) {
    return {
        op: GatewayOpcodes.VoiceStateUpdate,
        d: {
            guild_id: options.guildId,
            channel_id: leave ? null : options.voiceChannelId,
            self_deaf: options.selfDeaf ??= false,
            self_mute: options.selfMute ??= false
        }
    };
}