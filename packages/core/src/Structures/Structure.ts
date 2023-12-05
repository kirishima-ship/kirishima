/* eslint-disable @typescript-eslint/no-extraneous-class */
import { Extendable } from "../typings/index.js";
import { KirishimaFilter } from "./Filter.js";

import { KirishimaNode } from "./Node.js";
import { KirishimaPlayer } from "./Player.js";
import { KirishimaPartialTrack } from "./PartialTrack.js";
import { KirishimaTrack } from "./Track.js";

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
