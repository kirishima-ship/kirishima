import { PlayerCacheDriver, PlayerData } from "@kirishima/core-driver";
import { Collection } from "@discordjs/collection";

export class MapPlayerDriver implements PlayerCacheDriver {
    public collection = new Collection<string, PlayerData>();

    public get(clientId: string, guildId: string): PlayerData | null {
        return this.collection.get(guildId) ?? null;
    }

    public set(clientId: string, guildId: string, data: PlayerData): PlayerData {
        this.collection.set(guildId, data);
        return data;
    }

    public delete(clientId: string, guildId: string): void {
        this.collection.delete(guildId);
    }

    public values(_clientId: string): PlayerData[] {
        return Array.from(this.collection.values());
    }

    public size(_clientId: string): number {
        return this.collection.size;
    }
}

