import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type ClickEventDocument = HydratedDocument<ClickEvent>;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class ClickEvent {
  @ApiProperty()
  @Prop({ index: true })
  shortUrl!: string;

  @ApiProperty()
  @Prop()
  ipHash!: string;

  @ApiProperty()
  @Prop()
  userAgent!: string;

  @ApiProperty()
  @Prop()
  referer!: string;

  @ApiProperty()
  timestamp!: Date;
}

export const ClickEventSchema = SchemaFactory.createForClass(ClickEvent);
