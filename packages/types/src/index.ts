export interface PlayerOptions {
    guildId: string;
    shardId?: number;
    voiceChannelId: string;
    textChannelId?: string;
    selfDeaf?: boolean;
    selfMute?: boolean;
}
