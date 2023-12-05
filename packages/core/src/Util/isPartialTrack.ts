import { KirishimaPartialTrack } from "../Structures/PartialTrack.js";

export function isPartialTrack(track: unknown): track is KirishimaPartialTrack {
    return track instanceof KirishimaPartialTrack;
}
