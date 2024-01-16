import { Awaitable } from "@sapphire/utilities";

// TODO: Generic or Unknown?
export abstract class PlayerCacheDriver {
    public abstract get(clientId: string, guildId: string): Awaitable<PlayerData | null>;
    public abstract set(clientId: string, guildId: string, data: PlayerData): Awaitable<PlayerData>;
    public abstract delete(clientId: string, guildId: string): Awaitable<void>;
    public abstract values(clientId: string): Awaitable<PlayerData[]>;
    public abstract size(clientId: string): Awaitable<number>;
}

export interface PlayerVoiceData {
    session_id: string;
    endpoint: string;
    token: string;
}

export interface PlayerData {
    id: string;
    client_id: string;
    guild_id: string;
    position: number;
    text_channel_id: string;
    voice_channel_id: string;
    message_id?: string;
    loop: number;
    node: string;
    index: number;
    volume: number;
    voice: PlayerVoiceData;
}
