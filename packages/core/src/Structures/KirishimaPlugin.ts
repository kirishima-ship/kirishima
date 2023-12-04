import { Awaitable } from '@sapphire/utilities';
import { Kirishima } from './Kirishima.js';

export abstract class KirishimaPlugin {
    public constructor(public options: { name: string }) { }
    public abstract load(kirishima: Kirishima): Awaitable<unknown>;
}