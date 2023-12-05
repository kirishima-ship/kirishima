import { Awaitable } from "@sapphire/utilities";
import { PartialLavalinkTrack } from "src/typings/index.js";

/**
 * @description Represents a unplayable track by lavalink. This is a partial track. that must be resolved later
 */
export class KirishimaPartialTrack {
    public track?: string;
    public info: PartialLavalinkTrack["info"];
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
