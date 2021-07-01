/* NOTES

    say we have a document of type Doc,
    and we want to supercharge it with crdt syncing powers.
    we want to wrap this Doc in our crdt class, namely a Cape.

    interface Doc {
        media: Media,
        content: Content,
        writer: Writer
    }

    Cape<Doc> will wrap our Doc type and make it, and every subfield syncable.
    essentially,
    Cape<Doc> {
        media: Cape<Media>,
        content: Cape<Content>,
        writer: Cape<Writer>
    }
*/

import { ADT, match, matchI } from "ts-adt";

type Primitive =
    | string
    | number
    | boolean
    | symbol
    | bigint;

type CapeInput<T> = Primitive | { [k: string]: CapeInput<T> };

const isPrimitive = (arg: any) => {
  return (
    typeof arg === "string" ||
    typeof arg === "number" ||
    typeof arg === "boolean"
  );
};

// export type Cape<T> = ADT<{
//     primitive: { value: T, version: number },
//     nested: { value: { [k: string]: Cape<T> }, version: number }
// }> 

export type NestedCape<T extends Record<string, {}>> = {
    value: { [K in keyof T]: Cape<T[K]> },
    version: number
}

export type PrimitiveCape<T extends Primitive> = {
    value: T,
    version: number
}

export type NullCape = {}

export type Cape<T> = 
    T extends Primitive ? PrimitiveCape<T> 
    : T extends Record<string, {}> ? NestedCape<T>
    : NullCape

// export const create = <T>(t: T): Cape<T> => {
//     if (isPrimitive(t)) {
//         return {
//             value: t,
//             version: 0
//         };
//     } else if (typeof t === "object") {
//         let cape: { value: { [k: string]: Cape<T> }; version: number } = {
//         value: {},
//         version: 0,
//         };
//         for (let k in t) {
//         cape.value[k] = create(t[k]);
//         }
//         return cape;
//     }
//     return { value: "", version: 0 };
// };

// export const merge = <T extends Primitive>(a: PrimitiveCape<T>, b: PrimitiveCape<T>) => {
//   if (a.version > b.version) return a;
//   else if (a.version < b.version) return b;
//   else {
//     return a.value > b.value ? a : b;
//   }
// };

export const merge = <T extends Record<string, {}>>(a: Cape<T>, b: Cape<T>) => {
    if (a.version > b.version) return a;
    else if (a.version < b.version) return b;
    else {
        let cape: { value: { [k: string]: Cape<T> }; version: number } = {
            value: {},
            version: 0,
        };
        for (let k in a) {
            cape.value[k] = merge(a.value[k], b.value[k]);
        }
        return cape;
    }
  };
