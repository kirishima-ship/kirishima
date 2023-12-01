import { URL } from "node:url";
import { QueryError } from "../Utilities/QueryError.js";
import { FetchResultTypes } from "../Utilities/ResultTypes.js";
import { fetch as undiciFetch, RequestInfo, RequestInit, Response, Pool, Dispatcher } from "undici";

export async function fetch<T>(input: RequestInfo, init?: RequestInit | undefined, type?: FetchResultTypes.JSON): Promise<T>;
export async function fetch(input: RequestInfo, init?: RequestInit | undefined, type?: FetchResultTypes.Buffer): Promise<Buffer>;
export async function fetch(input: RequestInfo, init?: RequestInit | undefined, type?: FetchResultTypes.Blob): Promise<Blob>;
export async function fetch(input: RequestInfo, init?: RequestInit | undefined, type?: FetchResultTypes.Text): Promise<string>;
export async function fetch(input: RequestInfo, init?: RequestInit | undefined, type?: FetchResultTypes): Promise<unknown> {
    const result: Response = await undiciFetch(input, init);

    if (!result.ok) throw new QueryError(String(input), result.status, await result.clone().text());

    switch (type) {
        case FetchResultTypes.Buffer:
            return Buffer.from(await (await result.blob()).arrayBuffer());
        case FetchResultTypes.Blob:
            return result.blob();
        case FetchResultTypes.JSON:
            return result.json();
        case FetchResultTypes.Text:
            return result.text();
        default:
            return result;
    }
}

export async function fetchPool<T>(
    input: string | URL,
    requestOptions: Dispatcher.RequestOptions,
    options?: Pool.Options,
    type?: FetchResultTypes.JSON
): Promise<T>;
export async function fetchPool(
    input: string | URL,
    requestOptions: Dispatcher.RequestOptions,
    options?: Pool.Options,
    type?: FetchResultTypes.Buffer
): Promise<Buffer>;
export async function fetchPool(
    input: string | URL,
    requestOptions: Dispatcher.RequestOptions,
    options?: Pool.Options,
    type?: FetchResultTypes.Blob
): Promise<Blob>;
export async function fetchPool(
    input: string | URL,
    requestOptions: Dispatcher.RequestOptions,
    options?: Pool.Options,
    type?: FetchResultTypes.Text
): Promise<string>;
export async function fetchPool(input: string | URL, requestOptions: Dispatcher.RequestOptions, options?: Pool.Options, type?: FetchResultTypes): Promise<unknown> {
    const result = await new Pool(input, options).request(requestOptions);

    if (result.statusCode > 300) throw new QueryError(String(input), result.statusCode, await result.body.text());

    switch (type) {
        case FetchResultTypes.Buffer:
            return Buffer.from(await (await result.body.blob()).arrayBuffer());
        case FetchResultTypes.Blob:
            return result.body.blob();
        case FetchResultTypes.JSON:
            return result.body.json();
        case FetchResultTypes.Text:
            return result.body.text();
        default:
            return result.body;
    }
}
