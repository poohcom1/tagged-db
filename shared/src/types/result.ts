type Ok<T> = T extends void ? { ok: true } : { ok: true; value: T };

type Err<E> = { ok: false; error: E };

export type Result<T, E = string> = Ok<T> | Err<E>;

export function Ok(): Ok<void>;
export function Ok<T>(value: T): Ok<T>;
export function Ok<T>(value?: T | undefined): Ok<T> {
  return value === undefined
    ? ({ ok: true, value: undefined } as Ok<T>)
    : ({ ok: true, value } as Ok<T>);
}
export function Err<E>(error: E): Err<E> {
  return { ok: false, error };
}
export function Result<T>(value: T | undefined, error?: string): Result<T> {
  if (value === undefined) {
    return { ok: false, error: error ?? "undefined" };
  }
  return Ok(value);
}

export function unwrapOrThrow<T, E>(
  result: Result<T, E>,
): T extends void ? unknown : T {
  if (result.ok) {
    if ("value" in result) return result.value as any;
    else return undefined as any;
  }
  throw result.error;
}
