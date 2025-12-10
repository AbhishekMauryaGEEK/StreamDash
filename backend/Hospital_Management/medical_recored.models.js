import mongoose from "mongoose";

const RecordSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    genericName: {
      type: String,
      trim: true
    },
    brandName: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      enum: ['antibiotic', 'painkiller', 'antiviral', 'antifungal', 'vitamin', 'cardiac', 'diabetes', 'other'],
      required: true
    },
    type: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler'],
      required: true
    },
    strength: {
      type: String, 
      required: true
    },
    dosageForm: String, 
    

    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    frequency: {
      type: String, 
      required: true
    },
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months']
      }
    },
    instructions: {
      type: String,
      trim: true
    },

    batchNumber: String,
    manufacturingDate: Date,
    expiryDate: {
      type: Date,
      required: true
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    pricePerUnit: {
      type: Number,
      min: 0
    },
    sideEffects: [String],
    contraindications: [String],
    requiresPrescription: {
      type: Boolean,
      default: true
    },
    
    status: {
      type: String,
      enum: ['active', 'discontinued', 'completed', 'expired'],
      default: 'active'
    }
    
  },
  { timestamps: true }
);
RecordSchema.index({ expiryDate: 1 });
RecordSchema.index({ patientId: 1, status: 1 });
RecordSchema.index({ medicineName: 'text', genericName: 'text' });

export const Record = mongoose.model('Record', RecordSchema);
