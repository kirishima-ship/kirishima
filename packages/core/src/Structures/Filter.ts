import {
    ChannelMixEqualizer,
    DistortionEqualizer,
    Equalizer,
    KaraokeEqualizer,
    LowPassEqualizer,
    RotationEqualizer,
    TimeScaleEqualizer,
    TremoloEqualizer,
    VibratoEqualizer
} from "lavalink-api-types";

export class KirishimaFilter {
    public volume: number | null;
    public equalizer: Equalizer[] | null;
    public karaoke: KaraokeEqualizer | null;
    public timescale: TimeScaleEqualizer | null;
    public tremolo: TremoloEqualizer | null;
    public vibrato: VibratoEqualizer | null;
    public rotation: RotationEqualizer | null;
    public distortion: DistortionEqualizer | null;
    public channelMix: ChannelMixEqualizer | null;
    public lowPass: LowPassEqualizer | null;

    public constructor(options?: KirishimaFilterOptions) {
        this.volume = options?.volume ?? 1.0;
        this.equalizer = options?.equalizer ?? null;
        this.karaoke = options?.karaoke ?? null;
        this.timescale = options?.timescale ?? null;
        this.tremolo = options?.tremolo ?? null;
        this.vibrato = options?.vibrato ?? null;
        this.rotation = options?.rotation ?? null;
        this.distortion = options?.distortion ?? null;
        this.channelMix = options?.channelMix ?? null;
        this.lowPass = options?.lowPass ?? null;
    }
}

export interface KirishimaFilterOptions {
    volume: number | null;
    equalizer: Equalizer[] | null;
    karaoke: KaraokeEqualizer | null;
    timescale: TimeScaleEqualizer | null;
    tremolo: TremoloEqualizer | null;
    vibrato: VibratoEqualizer | null;
    rotation: RotationEqualizer | null;
    distortion: DistortionEqualizer | null;
    channelMix: ChannelMixEqualizer | null;
    lowPass: LowPassEqualizer | null;
}
