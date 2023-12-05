import { GatewayVoiceServerUpdateDispatch, GatewayVoiceStateUpdateDispatch } from "discord-api-types/gateway/v9";
import { Snowflake } from "discord-api-types/globals";
import { WebsocketOpEnum } from "lavalink-api-types";
import { KirishimaPlayerOptions, KirishimaNode, createVoiceChannelJoinPayload, Kirishima } from "../index.js";

export class BasePlayer {
    public get voiceState() {
        return this.node.voiceStates.get(this.options.guildId);
    }

    public get voiceServer() {
        return this.node.voiceServers.get(this.options.guildId);
    }

    public constructor(public options: KirishimaPlayerOptions, public kirishima: Kirishima, public node: KirishimaNode) { }

    public async connect() {
        await this.kirishima.options.send(this.options, createVoiceChannelJoinPayload(this.options));
        return this;
    }

    public async disconnect() {
        await this.kirishima.options.send(this.options, createVoiceChannelJoinPayload(this.options, true));
        return this;
    }

    public async setServerUpdate(packet: GatewayVoiceServerUpdateDispatch) {
        this.node.voiceServers.set(packet.d.guild_id, packet.d);
        return this.sendVoiceUpdate(packet.d.guild_id);
    }

    public async setStateUpdate(packet: GatewayVoiceStateUpdateDispatch) {
        if (packet.d.user_id !== this.kirishima.options.clientId) return;

        if (packet.d.channel_id && packet.d.guild_id) {
            this.node.voiceStates.set(packet.d.guild_id, packet.d);
            return this.sendVoiceUpdate(packet.d.guild_id);
        }

        if (packet.d.guild_id) {
            this.node.voiceServers.delete(packet.d.guild_id);
            this.node.voiceStates.delete(packet.d.guild_id);
            await this.connect();
        }
    }

    public async sendVoiceUpdate(guildId: Snowflake) {
        const voiceState = this.node.voiceStates.get(guildId);
        const event = this.node.voiceServers.get(guildId);

        if (event && voiceState) {
            await this.node.ws.send({
                op: WebsocketOpEnum.VOICE_UPDATE,
                guildId,
                sessionId: voiceState.session_id,
                event
            });
        }
    }
}
