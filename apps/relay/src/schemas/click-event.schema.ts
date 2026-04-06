import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClickEventDocument = HydratedDocument<ClickEvent>;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class ClickEvent {
  @Prop({ index: true })
  shortUrl!: string;

  @Prop()
  ipHash!: string;

  @Prop()
  userAgent!: string;

  @Prop()
  referer!: string;

  timestamp!: Date;
}

export const ClickEventSchema = SchemaFactory.createForClass(ClickEvent);
