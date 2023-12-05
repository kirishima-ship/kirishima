import { KirishimaTrack } from "../Structures/Track.js";

export function isTrack(track: unknown): track is KirishimaTrack {
    return track instanceof KirishimaTrack;
}
