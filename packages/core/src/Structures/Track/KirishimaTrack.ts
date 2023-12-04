import { Awaitable } from '@sapphire/utilities';
import { LavalinkTrack } from 'lavalink-api-types';

/**
 * @description Represents a playable track by lavalink.
 */
export class KirishimaTrack {
    public track: string;
    public info: LavalinkTrack['info'];
    public constructor(raw: LavalinkTrack) {
        this.track = raw.track;
        this.info = raw.info;
    }

    public toJSON() {
        return {
            track: this.track,
            info: this.info
        };
    }

    public thumbnailURL(size?: unknown): Awaitable<string | null> {
        return this.info.uri.includes('youtube') ? `https://img.youtube.com/vi/${this.info.identifier}/${size ?? 'default'}.jpg` : null;
    }
}