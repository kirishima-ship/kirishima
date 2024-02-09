export class QueryError extends Error {
    public readonly url: string;
    public readonly code: number;
    public readonly body: string;
    public readonly name = "QueryError";

    public constructor(url: string, code: number, body: string) {
        super(`Failed to request '${url}' with code ${code}.`);
        this.url = url;
        this.code = code;
        this.body = body;
    }
}
