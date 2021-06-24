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

/* 
    shelf.merge = (a, b, dont_modify) => {
        let change = null

        if (!a) a = [null, -1]

        if (!Array.isArray(b)) b = [b]

        let both_objs = is_obj(a[0]) && is_obj(b[0])

        ?If the version of b is null
        if (b[1] == null) b = [b[0], a[1] + (both_objs ? 0 : 1)]

        ?else if the version of b is 'add'
        else if (b[1] == 'add') b = [a[0] + b[0], a[1] + 1]

        ?If the version of b is larger than the version of a, or if a and b have the same version but b has a greater value
        if (b[1] > (a[1] ?? -1) || (b[1] == a[1] && greater_than(b[0], a[0]))) {
            if (is_obj(b[0])) {
                if (!dont_modify) {
                    a[0] = {}
                    a[1] = b[1]
                }
                change = shelf.merge(dont_modify ? [{}, b[1]] : a, b, dont_modify)
                if (!change) change = [{}, b[1]]
            } else {
                if (!dont_modify) {
                    a[0] = b[0]
                    a[1] = b[1]
                }
                change = b
            }
        ?Else if a and b have the same version and theyre both objects
        } else if (b[1] == a[1] && both_objs) {
            ?Loop through key shelf pairs of b
            for (let [k, v] of Object.entries(b[0])) {
                ?If we can modify and a has no shelf at the current key
                if (!dont_modify && !a[0][k]) a[0][k] = [null, -1]
                ?Assign diff to be the result of merging a[0][k] and the current shelf for b
                let diff = shelf.merge(a[0][k], v, dont_modify)
                if (diff) {
                    ?If diff is not null, set change to be a shelf with an empty object for value, and add a key shelf pair where the shelf is diff
                    if (!change) change = [{}, b[1]]
                    change[0][k] = diff
                }
            }
        }
            return change
    }
*/


/*
    match (a, b) with
    | null, null => null
    | a, null => a
    | null, b => b
    | ({ _, v1 }, { _, v2 }) when v1 > v2 => a
    | ({ _, v1 }, { _, v2 }) when v1 < v2 => b
    | ({ t1, v }, { t2, _ }) => { value: max(t1, t2), version: v }
    | ({ s1, v }, { s2, _ }) when s1 > s2 => {
        let merged = {}
        for (k, v) in s1 {
            let val = merge(v, s2[k])
            merged[k] = val
        }
        return { value: merged, version: v }
    }
    | ({ s1, v }, { s2, _ }) when s1 < s2 => {
        let merged = {}
        for (k, v) in s2 {
            let val = merge(v, s1[k])
            merged[k] = val
        }
        return { value: merged, version: v }
    }

    note: "max" isn't a mathematical max function, we just mean keep the "greatest" object,
    wtv we define that to be
*/

type Primitive = string | number | boolean

const isPrimitive = (arg: any) => {
    return typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean'
}


export interface Cape<T> {
    value: Primitive | { [K in keyof T]: Cape<T[K]>};
    version: number;
}


export const merge = <T>(a: Cape<T>, b: Cape<T>): Cape<T> => {
  if (a.version > b.version) return a
  else if (a.version < b.version) return b
  else {
    if (isPrimitive(a.value)) {
        
    }
    return a
  }
};
