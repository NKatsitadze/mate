import mongoose, { Schema, InferSchemaType } from 'mongoose';

const AllowedEmailSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    note: { type: String, required: false },
    addedByAdminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export type AllowedEmailDocument = InferSchemaType<typeof AllowedEmailSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AllowedEmailModel =
  mongoose.models.AllowedEmail || mongoose.model('AllowedEmail', AllowedEmailSchema);
