import { PlayerCacheDriver, PlayerData } from "@kirishima/core-driver";
import { Redis, RedisOptions } from "ioredis";
import { redisScan } from "@nezuchan/utilities";

export class RedisPlayerDriver implements PlayerCacheDriver {
    public redis: Redis;
    public constructor(options: RedisOptions) {
        this.redis = new Redis(options);
    }

    public async get(clientId: string, guildId: string): Promise<PlayerData | null> {
        const data = (await this.redis.get(`${clientId}:${guildId}`))!;

        if (!data) return null;

        const parsedData: PlayerData = JSON.parse(data);
        return parsedData;
    }

    public async set(clientId: string, guildId: string, data: PlayerData): Promise<PlayerData> {
        await this.redis.set(`${clientId}:${guildId}`, JSON.stringify(data));
        return data;
    }

    public async delete(clientId: string, guildId: string): Promise<void> {
        await this.redis.del(`${clientId}:${guildId}`);
    }

    // TODO: check if this working?
    public async values(clientId: string, count = 1000): Promise<PlayerData[]> {
        const data = await redisScan(this.redis, clientId, count);
        const result: PlayerData[] = data.map(val => JSON.parse(val));

        return result;
    }

    // TODO: unlimit redis scan
    public async size(clientId: string): Promise<number> {
        const data = await redisScan(this.redis, clientId, 1000);
        return data.length;
    }
}
