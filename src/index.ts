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

type Primitive = string | number | boolean | bigint;

type CapeMap = { [k: string]: Cape };

const isPrimitive = (arg: any): boolean => {
  return (
    typeof arg === "string" ||
    typeof arg === "number" ||
    typeof arg === "boolean" ||
    typeof arg === "bigint"
  );
};

export abstract class Cape {
  constructor(public version: number) {}
}

export class PrimitiveCape extends Cape {
  constructor(version: number, public value: Primitive) {
    super(version);
  }
}

export class NestedCape extends Cape {
  constructor(version: number, public value: CapeMap) {
    super(version);
  }
}

export class NullCape extends Cape {
  public value: null;
  constructor() {
    super(-1);
    this.value = null;
  }
}

export const create = (t: any): Cape => {
  if (isPrimitive(t)) {
    return new PrimitiveCape(0, t);
  } else if (typeof t === "object") {
    let cape: CapeMap = {};
    for (let key in t) {
      cape[key] = create(t[key]);
    }
    return new NestedCape(0, cape);
  }
  return new NullCape();
};

export const merge = (a: Cape, b: Cape): Cape => {
  //If at least one is null
  if (!a) return b;
  else if (!b) return a;
  if (a instanceof NullCape) return b;
  else if (b instanceof NullCape) return a;

  //If versions are different
  if (a.version > b.version) return a;
  else if (a.version < b.version) return b;
  
  //If versions are the same
  else if (a instanceof PrimitiveCape && b instanceof PrimitiveCape) {
    return a.value > b.value ? a : b;
  } else if (a instanceof NestedCape && b instanceof NestedCape) {
    let cape: CapeMap = {};
    if (Object.keys(a.value).length > Object.keys(b.value).length) {
      for (let key in a.value) {
        cape[key] = merge(a.value[key], b.value[key]);
      }
    } else {
      for (let key in b.value) {
        cape[key] = merge(a.value[key], b.value[key]);
      }
    }
    return new NestedCape(a.version, cape);
  }

  return new NullCape();
};
