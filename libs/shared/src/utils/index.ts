import type { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { DatabaseError } from 'pg-protocol';

export function cookie(
  res: Response,
  key: string,
  val: string,
  ttl: number = 3600,
) {
  res.cookie(key, val, {
    httpOnly: true,
    signed: true,
    secure: true,
    maxAge: ttl,
  });
}

const BASE62_CHARS =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function intToBase62(num: number) {
  if (num === 0) return BASE62_CHARS[0];
  let result = '';
  while (num > 0) {
    const rem = num % 62;
    result = BASE62_CHARS[rem] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

export function intToBase62Fixed(num: number, length = 6) {
  const base62 = intToBase62(num);
  if (base62.length > length) {
    throw new Error('Number too large for fixed length');
  }
  return base62.padStart(length, '0');
}

export const isQueryFailedError = (
  err: unknown,
): err is QueryFailedError & DatabaseError => err instanceof QueryFailedError;
