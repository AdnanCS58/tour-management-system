import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a document title'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['Ticket', 'Reservation', 'Passport', 'Visa', 'Insurance', 'Other'],
    default: 'Other',
  },
  fileData: {
    type: String, // Base64 encoded file
    default: '',
  },
  fileName: {
    type: String,
    default: '',
  },
  fileType: {
    type: String, // MIME type
    default: '',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);

export default Document;