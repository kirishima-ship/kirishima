import { Kirishima } from './Kirishima.js';
import type { KirishimaPlayerOptions } from '../typings/index.js';
import { KirishimaNode, isTrack } from '../index.js';

import {
    ChannelMixEqualizer,
    DistortionEqualizer,
    Equalizer,
    KaraokeEqualizer,
    LowPassEqualizer,
    RotationEqualizer,
    TimeScaleEqualizer,
    TremoloEqualizer,
    VibratoEqualizer,
    WebsocketOpEnum
} from 'lavalink-api-types';
import { KirishimaTrack } from './Track.js';
import { KirishimaFilter, KirishimaFilterOptions } from './Filter.js';
import { Structure } from './Structure.js';
import { BasePlayer } from './BasePlayer.js';

export class KirishimaPlayer extends BasePlayer {
    public filters = new (Structure.get('KirishimaFilter'))();
    public paused = false;
    public playing = false;

    public constructor(public options: KirishimaPlayerOptions, public kirishima: Kirishima, public node: KirishimaNode) {
        super(options, kirishima, node);
    }

    public async playTrack(track: KirishimaTrack | string, options?: { noReplace?: boolean; pause?: boolean; startTime?: number; endTime?: number }) {
        await this.node.ws.send({
            op: WebsocketOpEnum.PLAY,
            track: isTrack(track) ? track.track : track,
            guildId: this.options.guildId,
            noReplace: true,
            ...options
        });
        return this;
    }

    public async stopTrack() {
        await this.node.ws.send({
            op: WebsocketOpEnum.STOP,
            guildId: this.options.guildId
        });
        return this;
    }

    public async destroyPlayer() {
        await this.node.ws.send({
            op: WebsocketOpEnum.DESTROY,
            guildId: this.options.guildId
        });
        return this;
    }

    public async setVolume(volume: number) {
        if (volume < 0 || volume > 500) throw new Error('Volume must be between 0 and 500');
        this.filters.volume = volume / 100;
        await this.node.ws.send({
            op: WebsocketOpEnum.FILTERS,
            guildId: this.options.guildId,
            ...this.filters
        });
    }

    public async setTimescale(payload: TimeScaleEqualizer) {
        this.filters.timescale = payload;
        await this.node.ws.send({
            op: WebsocketOpEnum.FILTERS,
            guildId: this.options.guildId,
            ...this.filters
        });
        return this;
    }

    public async setEqualizer(payload: Equalizer[]) {
        this.filters.equalizer = payload;
        await this.node.ws.send({
            op: WebsocketOpEnum.FILTERS,
            guildId: this.options.guildId,
            ...this.filters
        });
        return this;
    }

    public async setKaraoke(payload: KaraokeEqualizer) {
        this.filters.karaoke = payload;
        await this.node.ws.send({
            op: WebsocketOpEnum.FILTERS,
            guildId: this.options.guildId,
            ...this.filters
        });
        return this;
    }

    public async setTremolo(payload: TremoloEqualizer) {
        this.filters.tremolo = payload;
        await this.node.ws.send({
            op: WebsocketOpEnum.FILTERS,
            guildId: this.options.guildId,
            ...this.filters
        });
        return this;
    }

    public async setVibrato(payload: VibratoEqualizer) {
        this.filters.vibrato = payload;
        await this.node.ws.send({
            op: WebsocketOpEnum.FILTERS,
            guildId: this.options.guildId,
            ...this.filters
        });
        return this;
    }

    public async setRotation(payload: RotationEqualizer) {
        this.filters.rotation = payload;
        await this.node.ws.send({
            op: WebsocketOpEnum.FILTERS,
            guildId: this.options.guildId,
            ...this.filters
        });
        return this;
    }

    public async setDistortion(payload: DistortionEqualizer) {
        this.filters.distortion = payload;
        await this.node.ws.send({
            op: WebsocketOpEnum.FILTERS,
            guildId: this.options.guildId,
            ...this.filters
        });
        return this;
    }

    public async setChannelMix(payload: ChannelMixEqualizer) {
        this.filters.channelMix = payload;
        await this.node.ws.send({
            op: WebsocketOpEnum.FILTERS,
            guildId: this.options.guildId,
            ...this.filters
        });
        return this;
    }

    public async setLowPass(payload: LowPassEqualizer) {
        this.filters.lowPass = payload;
        await this.node.ws.send({
            op: WebsocketOpEnum.FILTERS,
            guildId: this.options.guildId,
            ...this.filters
        });
        return this;
    }

    public async setGroupedFilters(payload: KirishimaFilterOptions) {
        this.filters = new KirishimaFilter(payload);
        await this.node.ws.send({
            op: WebsocketOpEnum.FILTERS,
            guildId: this.options.guildId,
            ...this.filters
        });
    }

    public async setPaused(paused: boolean) {
        await this.node.ws.send({
            op: WebsocketOpEnum.PAUSE,
            guildId: this.options.guildId,
            pause: paused
        });
        this.paused = paused;
        return this;
    }

    public async seekTo(position: number) {
        if (this.playing) {
            await this.node.ws.send({
                op: WebsocketOpEnum.SEEK,
                guildId: this.options.guildId,
                position
            });
            return this;
        }
        throw new Error('There are no playing track currently.');
    }
}