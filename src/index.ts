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

type Primitive = string | number | boolean | bigint;

type CapeInput<T> = Primitive | { [k: string]: CapeInput<T> };

const isPrimitive = (arg: any) => {
  return (
    typeof arg === "string" ||
    typeof arg === "number" ||
    typeof arg === "boolean" ||
    typeof arg === "bigint"
  );
};

// export type Cape<T> = ADT<{
//     primitive: { value: T, version: number },
//     nested: { value: { [k: string]: Cape<T> }, version: number }
// }>

export type NestedCape<T extends { [K in keyof T]: T[K] }> = {
  value: T;
  version: number;
};

export type PrimitiveCape<T extends Primitive> = {
  value: T;
  version: number;
};

export type NullCape = { value: {}, version: -1 };

export type Cape<T> = T extends Primitive
  ? PrimitiveCape<T>
  : T extends { [K in keyof T]: T[K] }
  ? NestedCape<T>
  : NullCape;

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

interface PrimitiveInput<T> {
  a: PrimitiveCape<T>,
  b: PrimitiveCape<T>
}

interface NestedInput<T> {
  a: NestedCape<T>,
  b: NestedCape<T>
}

export const merge = <T>(input: PrimitiveInput<T> | NestedInput<T>): Cape<T> => {
  const { a, b } = input;
  if (a.version > b.version) return a as Cape<T>;
  else if (a.version < b.version) return b as Cape<T>;
  else if (isPrimitive(a.value)) {
    return primitiveMerge(a, b) as Cape<T>;
  } else {
    return nestedMerge(a, b) as Cape<T>;
  }
};

export const primitiveMerge = (
  a: PrimitiveCape<Primitive>,
  b: PrimitiveCape<Primitive>
): PrimitiveCape<Primitive> => {
  return a.value > b.value
      ? { value: a.value, version: a.version + 1 }
      : { value: b.value, version: b.version + 1 };
};

export const nestedMerge = <T extends { [K in keyof T]: T[K] }>(
  a: NestedCape<T>,
  b: NestedCape<T>
): NestedCape<T> => {
  let cape: { value: { [key: string]: any }; version: number } = {
    value: {},
    version: a.version + 1,
  };
  for (let k in a.value) {
    cape.value[k] = nestedMerge(a.value[k], b.value[k]);
  }
  return cape as NestedCape<T>;
};
