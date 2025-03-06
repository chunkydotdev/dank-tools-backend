import { Document, Schema, model } from "mongoose";

interface IVote {
  id?: string;
  voterName: string;
  timestamp: Date;
}

interface IOption {
  id?: string;
  text: string;
  votes: number;
  voters: IVote[];
}

interface IPoll extends Document {
  id: string;
  question: string;
  options: IOption[];
  createdAt: Date;
  endDate: Date;
  isActive: boolean;
  requireVoterName: boolean;
}

const voteSchema = new Schema<IVote>(
  {
    voterName: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

const optionSchema = new Schema<IOption>(
  {
    text: {
      type: String,
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
    voters: [voteSchema],
  },
  {
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

const pollSchema = new Schema<IPoll>(
  {
    question: {
      type: String,
      required: true,
    },
    options: [optionSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    requireVoterName: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Poll = model<IPoll>("Poll", pollSchema);
