/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
import { PlayerData } from "@kirishima/types";
import { Kirishima } from "./Kirishima.js";
import { KirishimaNode } from "./Node.js";
import { GatewayOpcodes, GatewayVoiceServerUpdateDispatch, GatewayVoiceServerUpdateDispatchData, GatewayVoiceState, GatewayVoiceStateUpdateDispatch } from "discord-api-types/v10";
import { Routes } from "lavalink-api-types/v4";

export class Player {
    public constructor(
        public data: PlayerData,
        public kirishima: Kirishima
    ) {

    }

    public get node(): KirishimaNode {
        return this.kirishima.resolveNode(this.data.node)!;
    }

    public get guildId(): string {
        return this.data.guild_id;
    }

    public get channelId(): string | undefined {
        return this.data.voice_channel_id;
    }

    public get voiceState(): GatewayVoiceState | undefined {
        return this.node.voiceStates.get(this.guildId);
    }

    public get voiceServer(): GatewayVoiceServerUpdateDispatchData | undefined {
        return this.node.voiceServers.get(this.guildId);
    }

    public async connect(channelId?: string, options?: { selfDeaf?: boolean; selfMute?: boolean }): Promise<void> {
        if (channelId && (channelId !== this.channelId)) {
            this.data.voice_channel_id = channelId;
            await this.kirishima.options.savePlayer(this.data);
        }

        await this.kirishima.options.send({
            op: GatewayOpcodes.VoiceStateUpdate,
            d: {
                channel_id: channelId ?? this.channelId!,
                guild_id: this.guildId,
                self_deaf: options?.selfDeaf ?? true,
                self_mute: options?.selfMute ?? false
            }
        });
    }

    public async disconnect(): Promise<void> {
        this.data.voice_channel_id = undefined;
        await this.kirishima.options.savePlayer(this.data);

        await this.kirishima.options.send({
            op: GatewayOpcodes.VoiceStateUpdate,
            d: {
                channel_id: null,
                guild_id: this.guildId,
                self_deaf: false,
                self_mute: false
            }
        });
    }

    public async setServerUpdate(packet: GatewayVoiceServerUpdateDispatch): Promise<void> {
        this.node.voiceServers.set(packet.d.guild_id, packet.d);
        return this.sendVoiceUpdate();
    }

    public async setStateUpdate(packet: GatewayVoiceStateUpdateDispatch): Promise<void> {
        if (packet.d.user_id !== this.kirishima.clientId) return;

        if (packet.d.channel_id && packet.d.guild_id) {
            this.node.voiceStates.set(packet.d.guild_id, packet.d);
            return this.sendVoiceUpdate();
        }

        if (packet.d.guild_id) {
            this.node.voiceServers.delete(packet.d.guild_id);
            this.node.voiceStates.delete(packet.d.guild_id);
            await this.connect();
        }
    }

    public async sendVoiceUpdate(): Promise<void> {
        if (this.voiceServer && this.voiceState) {
            await this.node.rest.patch(Routes.player(this.node.sessionId!, this.guildId, true), {
                body: JSON.stringify({
                    voice: {
                        token: this.voiceServer.token,
                        endpoint: this.voiceServer.endpoint,
                        sessionId: this.voiceState.session_id
                    }
                })
            });
        }
    }
}
