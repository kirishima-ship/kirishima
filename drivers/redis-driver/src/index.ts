import { PlayerCacheDriver, PlayerData } from "@kirishima/core-driver";
import { Redis, RedisOptions } from "ioredis";
import { redisScan } from "@nezuchan/utilities";

export class RedisPlayerDriver implements PlayerCacheDriver {
    public redis: Redis;
    public constructor(options: RedisOptions) {
        this.redis = new Redis(options);
    }

    public async get(clientId: string, guildId: string): Promise<PlayerData | null> {
        const data = await this.redis.hgetall(`player:${clientId}:${guildId}`);

        const parsedData: any = {};
        for (const [key, value] of Object.entries(data)) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                parsedData[key] = JSON.parse(value);
            } catch {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                parsedData[key] = value;
            }
        }

        return parsedData;
    }

    public async set(clientId: string, guildId: string, data: PlayerData): Promise<PlayerData> {
        for (let [key, value] of Object.entries(data)) {
            if (typeof value === "object") {
                value = JSON.stringify(value);
            }
            await this.redis.hset(`player:${clientId}:${guildId}`, key, value as string);
        }

        return data;
    }

    public async delete(clientId: string, guildId: string): Promise<void> {
        await this.redis.hdel(`player:${clientId}:${guildId}`);
    }

    public async values(clientId: string): Promise<PlayerData[]> {
        const keys = await redisScan(this.redis, clientId, 5000);
        const values: any[] = [];

        for (const key of keys) {
            const data = await this.redis.hgetall(key);

            const parsedData: any = {};
            for (const [keyData, value] of Object.entries(data)) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    parsedData[keyData] = JSON.parse(value);
                } catch {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    parsedData[keyData] = value;
                }
            }

            values.push(parsedData);
        }

        return values;
    }

    public async size(clientId: string): Promise<number> {
        const data = await redisScan(this.redis, clientId, 5000);
        return data.length;
    }
}
