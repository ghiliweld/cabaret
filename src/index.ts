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

type Primitive = string | number | boolean | symbol | bigint;

type CapeMap = { [k: string]: Cape };

const isPrimitive = (arg: any): boolean => {
  return (
    typeof arg === "string" ||
    typeof arg === "number" ||
    typeof arg === "boolean" ||
    typeof arg === "symbol" ||
    typeof arg === "bigint"
  );
};

export abstract class Cape {
  constructor(
    public value: Primitive | CapeMap,
    public version: number
  ) {}
}

export class PrimitiveCape extends Cape {
  constructor(value: Primitive, version: number) {
    super(value, version);
  }
}


export class NestedCape extends Cape {
  constructor(value: CapeMap, version: number) {
    super(value, version);
  }
}

export class NullCape extends Cape {
  constructor() {
    super("", -1);
  }
}

export const create = (t: any): Cape => {
  if (isPrimitive(t)) {
    return new PrimitiveCape(t, 0);
  } else if (typeof t === "object") {
    let cape: CapeMap = {};
    for (let key in t) {
      cape[key] = create(t[key]);
    }
    return new NestedCape(cape, 0);
  }
  return new NullCape();
};

export const merge = (a: Cape, b: Cape): Cape => {
  //If at least one is null
  if (a instanceof NullCape) return b;
  else if (b instanceof NullCape) return a;

  //If versions are different
  if (a.version > b.version) return a;
  else if (a.version < b.version) return b;

  //If versions are the same
  else if (a instanceof PrimitiveCape && b instanceof PrimitiveCape) {
    return a.value > b.value ? a : b;
  } else if (a instanceof NestedCape && b instanceof PrimitiveCape) {
  } else if (a instanceof PrimitiveCape && b instanceof NestedCape) {
  } else if (a instanceof NestedCape && b instanceof NestedCape) {
  }

  return new NullCape();
};

// export const merge = <T extends Primitive, U extends { [K in keyof T]: T[K] }>(
//   input: PrimitiveInput<T> | NestedInput<U>
// ) => {
//   let a = input[0];
//   let b = input[1];
//   if (a.version > b.version) return a;
//   else if (a.version < b.version) return b;
//   else if (isPrimitive(a.value)) {
//     return a.value > b.value ? a : b;
//   } else if (typeof a.value === "object" && typeof b.value === "object") {
//     let cape: { value: { [key: string]: any }; version: number } = {
//       value: {},
//       version: a.version + 1,
//     };
//     for (let k in a.value) {
//       cape.value[k] = merge([a.value[k], b.value[k]]);
//     }
//     return cape as Cape<T>;
//   }
// };
