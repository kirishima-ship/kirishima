import { WebSocket } from 'ws';
import { Gateway } from '@kirishima/ws';
import { REST } from '@kirishima/rest';
import type { KirishimaNodeOptions } from '../typings/index.js';
import type { Kirishima } from './Kirishima.js';
import { GatewayVoiceServerUpdateDispatch, GatewayVoiceStateUpdateDispatch } from 'discord-api-types/gateway/v9';
import { LavalinkStatsPayload, WebsocketOpEnum } from 'lavalink-api-types';
import { BasePlayer } from './Base/BasePlayer.js';
import { Collection } from '@discordjs/collection';
import { Snowflake } from 'discord-api-types/globals';

export class KirishimaNode {
    public ws!: Gateway;
    public rest!: REST;
    public stats: LavalinkStatsPayload | undefined;
    public reconnect: { attempts: number; timeout?: NodeJS.Timeout } = { attempts: 0 };
    public voiceServers: Collection<Snowflake, GatewayVoiceServerUpdateDispatch['d']> = new Collection();
    public voiceStates: Collection<Snowflake, GatewayVoiceStateUpdateDispatch['d']> = new Collection();
    public constructor(public options: KirishimaNodeOptions, public kirishima: Kirishima) { }

    public get connected() {
        if (!this.ws) return false;
        return this.ws.connection?.readyState === WebSocket.OPEN;
    }

    public async connect(): Promise<KirishimaNode> {
        this.rest ??= new REST(`${this.options.url.endsWith('443') || this.options.secure ? 'https' : 'http'}://${this.options.url}`, {
            Authorization: (this.options.password ??= 'youshallnotpass')
        });
        if (this.connected) return this;
        const headers = {
            Authorization: (this.options.password ??= 'youshallnotpass'),
            'User-Id': this.kirishima.options.clientId!,
            'Client-Name': (this.kirishima.options.clientName ??= `Kirishima NodeJS Lavalink Client (https://github.com/kirishima-ship/core)`)
        };

        // @ts-expect-error If you know how to fix this, please open a PR.
        if (this.kirishima.options.node?.resumeKey) headers['Resume-Key'] = this.kirishima.options.node.resumeKey;
        this.ws = new Gateway(`${this.options.url.endsWith('443') || this.options.secure ? 'wss' : 'ws'}://${this.options.url}`, headers);
        await this.ws.connect();
        this.ws.on('open', this.open.bind(this));
        this.ws.on('message', this.message.bind(this));
        this.ws.on('error', this.error.bind(this));
        this.ws.on('close', this.close.bind(this));
        return this;
    }

    public disconnect() {
        this.ws.connection?.close(1000, 'Disconnected by user');
        if (this.reconnect.timeout) clearTimeout(this.reconnect.timeout);
    }

    public open(gateway: Gateway) {
        this.reconnect.attempts = 0;
        if (this.kirishima.options.node?.resumeKey && this.kirishima.options.node.resumeTimeout) {
            void this.ws.send({
                op: WebsocketOpEnum.CONFIGURE_RESUMING,
                key: this.kirishima.options.node.resumeKey,
                timeout: this.kirishima.options.node.resumeTimeout
            });
        }
        this.kirishima.emit('nodeConnect', this, gateway);
    }

    public close(gateway: Gateway, close: number) {
        this.kirishima.emit('nodeDisconnect', this, gateway, close);
        if (this.kirishima.options.node && this.kirishima.options.node.reconnectOnDisconnect) {
            if (this.reconnect.attempts < (this.kirishima.options.node.reconnectAttempts ?? 3)) {
                this.reconnect.attempts++;
                this.kirishima.emit('nodeReconnect', this, gateway, close);
                this.reconnect.timeout = setTimeout(() => {
                    void this.connect();
                }, this.kirishima.options.node.reconnectInterval ?? 5000);
            } else {
                this.kirishima.emit('nodeReconnectFailed', this, gateway, close);
            }
        }
    }

    public error(gateway: Gateway, error: Error) {
        this.kirishima.emit('nodeError', this, gateway, error);
    }

    public message(gateway: Gateway, raw: string) {
        try {
            const message = JSON.parse(raw);
            this.kirishima.emit('nodeRaw', this, gateway, message);
            if (message.op === WebsocketOpEnum.STATS) this.stats = message;
        } catch (e) {
            this.kirishima.emit('nodeError', this, gateway, e);
        }
    }

    public toJSON() {
        return {
            identifier: this.options.identifier,
            url: this.options.url,
            secure: this.options.secure,
            password: this.options.password,
            group: this.options.group
        };
    }

    public async handleVoiceServerUpdate(packet: GatewayVoiceServerUpdateDispatch) {
        const player = (await this.kirishima.options.fetchPlayer!(packet.d.guild_id)) as BasePlayer;
        if (player) {
            await player.setServerUpdate(packet);
        }
    }

    public async handleVoiceStateUpdate(packet: GatewayVoiceStateUpdateDispatch) {
        const player = (await this.kirishima.options.fetchPlayer!(packet.d.guild_id!)) as BasePlayer;
        if (player) {
            await player.setStateUpdate(packet);
        }
    }
}