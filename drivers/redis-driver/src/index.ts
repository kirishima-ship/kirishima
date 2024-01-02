import { PlayerCacheDriver, PlayerData } from "@kirishima/core-driver";
import { Redis, RedisOptions } from "ioredis";

export class RedisPlayerDriver implements PlayerCacheDriver {
    public redis: Redis;
    public constructor(options: RedisOptions) {
        this.redis = new Redis(options);
    }

    public async get(clientId: string, guildId: string): Promise<PlayerData | null> {
        const data = await this.redis.get(`${clientId}:${guildId}`);

        if (data) {
            
        };

        return null;
    }
}
