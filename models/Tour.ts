import mongoose from "mongoose";

const TourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a tour name"],
    trim: true,
  },
  destination: {
    type: String,
    required: [true, "Please provide a destination"],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, "Please provide a start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please provide an end date"],
  },
  description: {
    type: String,
    default: "",
  },
  coverImage: {
    type: String,
    default: "", // Can store base64 string
  },
  invitationCode: {
    type: String,
    unique: true,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      locationSharing: {
        type: Boolean,
        default: false,
      },
      lastLocation: {
        lat: Number,
        lng: Number,
        updatedAt: Date,
      },
    },
  ],
  emergencyContacts: [
    {
      name: String,
      phone: String,
      relation: String,
      notes: String,
    },
  ],
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
    },
  ],
  activities: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      action: String,
      details: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  settledPayments: [
    {
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      amount: Number,
      settlementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Settlement",
      },
      confirmedAt: Date,
    },
  ],
});

const Tour = mongoose.models.Tour || mongoose.model("Tour", TourSchema);

export default Tour;
