import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IJournalEntry extends Document {
  text: string;
  summary: string;
  mood: string;
  reflection: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    text: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    mood: {
      type: String,
      required: true,
      enum: ['positive', 'calm', 'anxious', 'neutral'],
    },
    reflection: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      default: 'anonymous',
    },
  },
  {
    timestamps: true,
  }
);

JournalEntrySchema.index({ createdAt: -1 });
JournalEntrySchema.index({ userId: 1, createdAt: -1 });

const JournalEntry: Model<IJournalEntry> =
  mongoose.models.JournalEntry || mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);

export default JournalEntry;
