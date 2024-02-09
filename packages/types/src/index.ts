export type PlayerOptions = {
    guildId: string;
    shardId?: number;
    voiceChannelId: string;
    textChannelId?: string;
    selfDeaf?: boolean;
    selfMute?: boolean;
};

export type ShardPayload = {
    op: number;
    d: {
        guild_id: string;
        channel_id: string | null;
        self_deaf: boolean;
        self_mute: boolean;
    };
};

export type PlayerVoiceData = {
    session_id: string;
    endpoint: string;
    token: string;
};

export type PlayerData = {
    id: string;
    client_id: string;
    guild_id: string;
    position: number;
    text_channel_id?: string;
    voice_channel_id?: string;
    message_id?: string;
    loop: number;
    node: string;
    index: number;
    volume: number;
    voice: PlayerVoiceData;
};
