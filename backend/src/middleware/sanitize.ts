import { Request, Response, NextFunction } from "express";

/**
 * Express 5 changed how `req.query` works, which breaks the stock
 * sanitization middleware in two separate ways:
 *
 *  1. `req.query` is defined via `defineGetter()` on the request prototype.
 *     It has **no setter**, so any middleware doing `req.query = value`
 *     throws:
 *       TypeError: Cannot set property query of #<IncomingMessage>
 *                  which has only a getter
 *     `express-mongo-sanitize@2` does exactly this for `body`, `params`,
 *     `headers` and `query` — it crashed *every single request*.
 *
 *  2. That getter re-parses the raw query string on **every access**, so the
 *     returned object identity changes between reads. Anything that mutates
 *     `req.query` in place (`hpp`) has its changes silently discarded, which
 *     silently disabled HTTP-parameter-pollution protection.
 *
 * This middleware therefore:
 *  - reads the query string exactly once,
 *  - strips every key MongoDB would treat as an operator (leading `$`, or
 *    containing `.`) recursively, for the query string and the body,
 *  - re-defines `req.query` as a plain writable **own** property so that
 *    downstream middleware (`hpp`) and controllers can read, mutate and
 *    assign it safely.
 */

/**
 * Keys MongoDB interprets as operators, e.g. `?password[$ne]=x` or `?a.b=1`.
 *
 * Express 5 defaults to the "simple" query parser, which keeps `x[$ne]` as a
 * *flat literal* key rather than a nested object — so the bracket form has to
 * be matched explicitly as well.
 */
const PROHIBITED_KEY = /^\$|\.|\[\$/;

/** Keys that could be used to walk up the prototype chain. */
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Recursively rebuilds `value` without any prohibited key.
 * Rebuilding (rather than deleting in place) also guarantees the result has a
 * clean prototype, so `__proto__` cannot be used for prototype pollution.
 */
const stripProhibited = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stripProhibited);
  if (!isPlainObject(value)) return value;

  const clean: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (PROHIBITED_KEY.test(key) || UNSAFE_KEYS.has(key)) continue;
    clean[key] = stripProhibited(nested);
  }
  return clean;
};

export const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
  // 1. Query string — read once, sanitized, then shadowed with a stable own
  //    property so `hpp` and the controllers operate on the same object.
  const cleanQuery = stripProhibited(req.query ?? {}) as Request["query"];
  Object.defineProperty(req, "query", {
    value: cleanQuery,
    writable: true,
    configurable: true,
    enumerable: true,
  });

  // 2. Body — `req.body` is a plain writable own property once a body parser
  //    has run, so it can be replaced wholesale.
  if (isPlainObject(req.body)) {
    req.body = stripProhibited(req.body);
  }

  // 3. Headers — mutated in place so Node/Express internals (host, auth, …)
  //    keep working on the same object.
  if (isPlainObject(req.headers)) {
    for (const key of Object.keys(req.headers)) {
      if (PROHIBITED_KEY.test(key) || UNSAFE_KEYS.has(key)) {
        delete (req.headers as Record<string, unknown>)[key];
      }
    }
  }

  next();
};
