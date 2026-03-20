import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UrlMappingDocument = HydratedDocument<UrlMapping>;

@Schema()
export class UrlMapping {
  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } })
  user!: mongoose.Types.ObjectId;

  @Prop()
  longUrl!: string;

  @Prop({ unique: true })
  shortUrl!: string;

  @Prop({ type: Date, expires: 0 })
  expiresIn!: Date;
}

export const UrlMappingSchema = SchemaFactory.createForClass(UrlMapping);
