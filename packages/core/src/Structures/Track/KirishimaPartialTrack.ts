import { Awaitable } from '@sapphire/utilities';

/**
 * @description Represents a unplayable track by lavalink. This is a partial track. that must be resolved later
 */
export class KirishimaPartialTrack {
    public track?: string;
    public info: PartialLavalinkTrack['info'];
    public constructor(raw: PartialLavalinkTrack) {
        this.track = raw.track;
        this.info = raw.info;
    }

    public toJSON() {
        return {
            track: this.track,
            info: this.info
        };
    }

    public thumbnailURL(_size?: unknown): Awaitable<string | null> {
        return null;
    }
}

export interface PartialLavalinkTrack {
    track?: string;
    info?: {
        identifier?: string;
        isSeekable?: boolean;
        author?: string;
        length?: number;
        isStream?: boolean;
        position?: number;
        title?: string;
        uri?: string;
        sourceName?: string;
    };
}