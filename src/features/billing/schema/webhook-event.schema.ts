import mongoose, { Schema, InferSchemaType } from 'mongoose';

const WebhookEventSchema = new Schema(
  {
    dodoEventId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: true }
);

export type WebhookEventDocument = InferSchemaType<typeof WebhookEventSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WebhookEventModel =
  mongoose.models.WebhookEvent || mongoose.model('WebhookEvent', WebhookEventSchema);
