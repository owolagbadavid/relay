export class ShortUrlRequest {
  customUrl?: StringValue;
  expiresIn!: number;
}

export class ShortUrlResponse {
  id!: number;
  shortUrl!: string;
}

class StringValue {
  value?: string;
}
