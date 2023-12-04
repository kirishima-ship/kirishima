/* eslint-disable @typescript-eslint/no-extraneous-class */
import type { Extendable } from '../typings/index.js';
import { KirishimaFilter } from './KirishimaFilter.js';

import { KirishimaNode } from './KirishimaNode.js';
import { KirishimaPlayer } from './KirishimaPlayer.js';
import { KirishimaPartialTrack } from './Track/KirishimaPartialTrack.js';
import { KirishimaTrack } from './Track/KirishimaTrack.js';

const structures = {
    KirishimaNode,
    KirishimaPlayer,
    KirishimaPartialTrack,
    KirishimaTrack,
    KirishimaFilter
};

export abstract class Structure {
    public constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }

    public static extend<K extends keyof Extendable, T extends Extendable[K]>(name: K, extender: (target: Extendable[K]) => T): T {
        if (!structures[name]) throw new TypeError(`"${name} is not a valid structure`);
        const extended = extender(structures[name]);
        structures[name] = extended;
        return extended;
    }

    public static get<K extends keyof Extendable>(name: K): Extendable[K] {
        const structure = structures[name];
        if (!structure) throw new TypeError('"Structure" must be provided.');
        return structure;
    }
}