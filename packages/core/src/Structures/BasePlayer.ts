import { GatewayVoiceServerUpdateDispatch, GatewayVoiceStateUpdateDispatch } from "discord-api-types/gateway/v9";
import { Snowflake } from "discord-api-types/globals";
import { shardPayload } from "@kirishima/utilities";
import { KirishimaNode, Kirishima } from "../index.js";
import { PlayerOptions } from "@kirishima/types";
import { Routes } from "lavalink-api-types/v4";
import { GatewayVoiceServerUpdateDispatchData, GatewayVoiceState } from "discord-api-types/v10";

export class BasePlayer {
    public get voiceState(): GatewayVoiceState | undefined {
        return this.node.voiceStates.get(this.options.guildId);
    }

    public get voiceServer(): GatewayVoiceServerUpdateDispatchData | undefined {
        return this.node.voiceServers.get(this.options.guildId);
    }

    public constructor(public options: PlayerOptions, public kirishima: Kirishima, public node: KirishimaNode) { }

    public async connect(): Promise<this> {
        await this.kirishima.options.send(this.options, shardPayload(this.options));
        return this;
    }

    public async disconnect(): Promise<this> {
        await this.kirishima.options.send(this.options, shardPayload(this.options, true));
        return this;
    }

    public async setServerUpdate(packet: GatewayVoiceServerUpdateDispatch): Promise<void> {
        this.node.voiceServers.set(packet.d.guild_id, packet.d);
        return this.sendVoiceUpdate(packet.d.guild_id);
    }

    public async setStateUpdate(packet: GatewayVoiceStateUpdateDispatch): Promise<void> {
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

    public async sendVoiceUpdate(guildId: Snowflake): Promise<void> {
        const voiceState = this.node.voiceStates.get(guildId);
        const event = this.node.voiceServers.get(guildId);

        if (event && voiceState && this.node.sessionId) {
            await this.node.rest.patch(Routes.player(this.node.sessionId, guildId), {
                body: JSON.stringify({
                    token: event.token,
                    endpoint: event.endpoint,
                    sessionId: voiceState.session_id
                })
            });
        }
    }
}
