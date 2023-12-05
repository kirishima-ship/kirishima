import { GatewayOpcodes } from "discord-api-types/gateway/v9";
import { KirishimaPlayerOptions } from "../typings/index.js";

export function createVoiceChannelJoinPayload(options: KirishimaPlayerOptions, leave?: boolean) {
    return {
        op: GatewayOpcodes.VoiceStateUpdate,
        d: {
            guild_id: options.guildId,
            channel_id: leave ? null : options.channelId,
            self_deaf: options.selfDeaf ??= false,
            self_mute: options.selfMute ??= false
        }
    };
}
