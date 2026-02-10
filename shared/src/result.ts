export type Ok<T> = T extends void ? { ok: true } : { ok: true; value: T };

export type Err<E> = { ok: false; error: E };

export type Result<T, E = string> = Ok<T> | Err<E>;

export function Ok<T>(value?: T): Ok<T> {
  return value === undefined
    ? ({ ok: true } as Ok<T>)
    : ({ ok: true, value } as Ok<T>);
}

export function Err<E>(error: E): Err<E> {
  return { ok: false, error };
}
