import { fetch, FetchResultTypes } from "@kirishima/fetch";
import { AsyncQueue } from "@sapphire/async-queue";
import { RoutePlannerStatusResponse, LoadTrackResponse, LavalinkTrack, LavalinkSource, LavalinkSourceEnum, LavalinkSearchIdentifierEnum, Routes } from "lavalink-api-types";
import { RequestInit } from "undici";
import { join } from "path";

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

    public resolveIdentifier(source: LavalinkSource): string {
        return source === LavalinkSourceEnum.Youtube
            ? LavalinkSearchIdentifierEnum.YT_SEARCH
            : source === LavalinkSourceEnum.Soundcloud
                ? LavalinkSearchIdentifierEnum.SC_SEARCH
                : source === LavalinkSearchIdentifierEnum.YTM_SEARCH
                    ? LavalinkSearchIdentifierEnum.YTM_SEARCH
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
                        : encodeURIComponent(`${this.resolveIdentifier(LavalinkSourceEnum.Youtube)}:${options}`)
                )
            );
        }
        const source = options.source ?? LavalinkSourceEnum.Youtube;
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

    public decodeTracks(trackOrTracks: LavalinkTrack["track"][] | LavalinkTrack["track"]): Promise<LavalinkTrack[]> {
        if (Array.isArray(trackOrTracks)) {
            return this.post<LavalinkTrack[]>(Routes.decodeTracks(), {
                body: JSON.stringify(trackOrTracks),
                headers: { ...this.headers, "Content-Type": "application/json" }
            });
        }
        return this.post<LavalinkTrack[]>(Routes.decodeTracks(), {
            body: JSON.stringify([trackOrTracks]),
            headers: { ...this.headers, "Content-Type": "application/json" }
        });
    }

    public async get<T>(route: string, init?: RequestInit | undefined): Promise<T> {
        await this.queue.wait();
        try {
            return await fetch(new URL(join(this.url, route)), { ...init, headers: this.headers }, FetchResultTypes.JSON);
        } finally {
            this.queue.shift();
        }
    }

    public async post<T>(route: string, init?: RequestInit | undefined): Promise<T> {
        await this.queue.wait();
        try {
            return await fetch(new URL(join(this.url, route)), { ...init, headers: this.headers, method: "POST" }, FetchResultTypes.JSON);
        } finally {
            this.queue.shift();
        }
    }

    public async patch<T>(route: string, init?: RequestInit | undefined): Promise<T> {
        await this.queue.wait();
        try {
            return await fetch(new URL(join(this.url, route)), { ...init, headers: this.headers, method: "PATCH" }, FetchResultTypes.JSON);
        } finally {
            this.queue.shift();
        }
    }

    public async delete<T>(route: string, init?: RequestInit | undefined): Promise<T> {
        await this.queue.wait();
        try {
            return await fetch(new URL(join(this.url, route)), { ...init, headers: this.headers, method: "DELETE" }, FetchResultTypes.JSON);
        } finally {
            this.queue.shift();
        }
    }
}
