import { match } from 'ts-pattern';

export interface Shelf<T> {
    value: T | { [key: string] : Shelf<T> },
    version: number
}

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
export const merge = <T>(a: Shelf<T>, b: Shelf<T>): Shelf<T> => {
    return a;
}