export interface PlayerOptions {
    guildId: string;
    shardId?: number;
    voiceChannelId: string;
    textChannelId?: string;
    selfDeaf?: boolean;
    selfMute?: boolean;
}

export interface ShardPayload {
    op: number;
    d: {
        guild_id: string;
        channel_id: string | null;
        self_deaf: boolean;
        self_mute: boolean;
    };
}
