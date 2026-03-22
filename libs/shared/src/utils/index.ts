import type { Response } from 'express';

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
