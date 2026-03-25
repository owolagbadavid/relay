export class ShortUrlRequest {
  customUrl?: StringValue;
}

export class ShortUrlResponse {
  id!: number;
  shortUrl!: string;
}

class StringValue {
  value?: string;
}
