import { fetch, FetchResultTypes } from "@kirishima/fetch";
import { AsyncQueue } from "@sapphire/async-queue";
import { RequestInit } from "undici";
import { join } from "path";
import { LavalinkSearchIdentifier, LavalinkSource, LoadTrackResponse, RoutePlannerStatusResponse, Routes, Track } from "lavalink-api-types/v4";

export class REST {
    public headers: Record<string, string> = {};
    public queue = new AsyncQueue();

    public routeplanner = {
        freeAddress: async (address: string): Promise<void> => {
            await this.post<string>(Routes.routePlannerFreeAddress(), { body: JSON.stringify({ address }) });
        },
        freeAllAddress: async (): Promise<void> => {
            await this.post<string>(Routes.routePlannerFreeAll());
        },
        status: async (): Promise<RoutePlannerStatusResponse> => this.get<RoutePlannerStatusResponse>(Routes.routePlannerStatus())
    };

    public constructor(public url: string, headers: Record<string, string> = {}) {
        this.headers = headers;
    }

    public isUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    public resolveIdentifier(source: string): string {
        return source === LavalinkSource.Youtube
            ? LavalinkSearchIdentifier.YTSearch
            : source === LavalinkSource.Soundcloud
                ? LavalinkSearchIdentifier.SCSearch
                : source === LavalinkSearchIdentifier.YTMSearch
                    ? LavalinkSearchIdentifier.YTMSearch
                    : source;
    }

    public setAuthorization(auth: string): this {
        this.headers["Authorization"] = auth;
        return this;
    }

    public loadTracks(options: { source?: LavalinkSource; query: string } | string): Promise<LoadTrackResponse> {
        if (typeof options === "string") {
            return this.get<LoadTrackResponse>(
                Routes.loadTracks(
                    this.isUrl(options)
                        ? encodeURIComponent(options)
                        : encodeURIComponent(`${this.resolveIdentifier(LavalinkSource.Youtube)}:${options}`)
                )
            );
        }
        const source = options.source ?? LavalinkSource.Youtube;
        const { query } = options;
        return this.get<LoadTrackResponse>(
            Routes.loadTracks(
                this.isUrl(options.query)
                    ? encodeURIComponent(query)
                    : query.includes(":")
                        ? query
                        : `${encodeURIComponent(`${this.resolveIdentifier(source)}:${query}`)}`
            )
        );
    }

    public decodeTracks(trackOrTracks: Track["encoded"][] | Track["encoded"]): Promise<Track[]> {
        if (Array.isArray(trackOrTracks)) {
            return this.post<Track[]>(Routes.decodeTracks(), {
                body: JSON.stringify(trackOrTracks),
                headers: { ...this.headers, "Content-Type": "application/json" }
            });
        }
        return this.post<Track[]>(Routes.decodeTracks(), {
            body: JSON.stringify([trackOrTracks]),
            headers: { ...this.headers, "Content-Type": "application/json" }
        });
    }

    public async get<T>(route: string, init?: RequestInit | undefined): Promise<T> {
        await this.queue.wait();
        try {
            return await fetch(new URL(join(this.url, route)), { ...init, headers: { ...this.headers, "Content-Type": "application/json" } }, FetchResultTypes.JSON);
        } finally {
            this.queue.shift();
        }
    }

    public async post<T>(route: string, init?: RequestInit | undefined): Promise<T> {
        await this.queue.wait();
        try {
            return await fetch(new URL(join(this.url, route)), { ...init, headers: { ...this.headers, "Content-Type": "application/json" }, method: "POST" }, FetchResultTypes.JSON);
        } finally {
            this.queue.shift();
        }
    }

    public async patch<T>(route: string, init?: RequestInit | undefined): Promise<T> {
        await this.queue.wait();
        try {
            return await fetch(new URL(join(this.url, route)), { ...init, headers: { ...this.headers, "Content-Type": "application/json" }, method: "PATCH" }, FetchResultTypes.JSON);
        } finally {
            this.queue.shift();
        }
    }

    public async delete<T>(route: string, init?: RequestInit | undefined): Promise<T> {
        await this.queue.wait();
        try {
            return await fetch(new URL(join(this.url, route)), { ...init, headers: { ...this.headers, "Content-Type": "application/json" }, method: "DELETE" }, FetchResultTypes.JSON);
        } finally {
            this.queue.shift();
        }
    }
}
