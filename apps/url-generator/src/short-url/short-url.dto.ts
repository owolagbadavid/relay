export class ShortUrlRequest {
  customUrl?: StringValue;
  expiresIn!: Long;
}

export class ShortUrlResponse {
  id!: number;
  shortUrl!: string;
}

class StringValue {
  value?: string;
}
