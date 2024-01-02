import { PlayerCacheDriver, PlayerData } from "@kirishima/core-driver";
import { Cirql, RecordSchema, select, create, count, del } from "cirql";
import { Surreal } from "surrealdb.js";
import { z } from "zod";

export const PlayerVoiceSchema = z.object({
    session_id: z.string(),
    endpoint: z.string(),
    token: z.string()
});

export const PlayerSchema = RecordSchema.extend({
    id: z.string(),
    client_id: z.string(),
    guild_id: z.string(),
    position: z.number(),
    text_channel_id: z.string(),
    voice_channel_id: z.string(),
    message_id: z.string().optional(),
    loop: z.number(),
    node: z.string(),
    index: z.number(),
    volume: z.number(),
    voice: PlayerVoiceSchema
});

export interface SurrealPlayerDriverOptions {
    namespace: string;
    database: string;
    auth: {
        username: string;
        password: string;
    };
}

export class SurrealPlayerDriver implements PlayerCacheDriver {
    public cirql: Cirql;
    public constructor(url: string, options?: SurrealPlayerDriverOptions | undefined) {
        const surreal = new Surreal();
        void surreal.connect(url, options);
        this.cirql = new Cirql(surreal);
    }

    public async get(clientId: string, guildId: string): Promise<PlayerData | null> {
        const player = await this.cirql.execute({
            query: select()
                .from("player")
                .with(PlayerSchema)
                .limit(1)
                .where({
                    guild_id: guildId,
                    client_id: clientId
                })
        });

        return player[0] ?? null;
    }

    public set(clientId: string, guildId: string, data: PlayerData): Promise<PlayerData> {
        return this.cirql.execute({
            query: create("player")
                .with(PlayerSchema)
                .setAll(data)
        });
    }

    public async delete(clientId: string, guildId: string): Promise<void> {
        await this.cirql.execute({
            query: del("player")
                .with(PlayerSchema)
                .where({
                    guild_id: guildId,
                    client_id: clientId
                })
        });
    }

    // TODO: Handle Cursor pagination
    public async values(clientId: string): Promise<PlayerData[]> {
        return this.cirql.execute({
            query: select()
                .from("player")
                .with(PlayerSchema)
                .where({
                    client_id: clientId
                })
        });
    }

    public size(clientId: string): Promise<number> {
        return this.cirql.execute({
            query: count("player")
                .where({
                    client_id: clientId
                })
        });
    }
}
