import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { HydratedDocument } from 'mongoose';

export type UrlMappingDocument = HydratedDocument<UrlMapping>;

@Schema({ timestamps: true })
export class UrlMapping {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user!: mongoose.Types.ObjectId;

  @ApiProperty()
  @Prop()
  longUrl!: string;

  @ApiProperty()
  @Prop({ unique: true })
  shortUrl!: string;

  @ApiProperty()
  @Prop({ type: Date, expires: 0 })
  expiresIn!: Date;

  @ApiProperty()
  @Prop({ default: 0 })
  clicks!: number;
}

export const UrlMappingSchema = SchemaFactory.createForClass(UrlMapping);
