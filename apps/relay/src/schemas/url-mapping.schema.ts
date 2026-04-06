import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UrlMappingDocument = HydratedDocument<UrlMapping>;

@Schema({ timestamps: true })
export class UrlMapping {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user!: mongoose.Types.ObjectId;

  @Prop()
  longUrl!: string;

  @Prop({ unique: true })
  shortUrl!: string;

  @Prop({ type: Date, expires: 0 })
  expiresIn!: Date;

  @Prop({ default: 0 })
  clicks!: number;
}

export const UrlMappingSchema = SchemaFactory.createForClass(UrlMapping);
