import mongoose from "mongoose";

const NurseSchema = new mongoose.Schema(
  {
    name: {
      first: { type: String, required: true, trim: true },
      last: { type: String, required: true, trim: true }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    profileImage: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    qualification: {
      type: String,
      required: true
    },
    specialization: {
      type: String,
      default: "General"
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true
    },
    experienceYears: {
      type: Number,
      default: 0
    },
    department: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'on_leave', 'resigned', 'suspended'],
      default: 'active'
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    salary: Number,
    currentShift: {
      type: String,
      enum: ['morning', 'evening', 'night', 'rotating'],
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    assignedWard: {
      type: String,
      trim: true
    },
    assignedPatients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    }],
    password: {
      type: String,
      select: false
    },
    role: {
      type: String,
      default: "nurse",
      immutable: true
    }
  },
  { timestamps: true }
);

NurseSchema.index({ email: 1 });
NurseSchema.index({ department: 1, currentShift: 1 });
NurseSchema.index({ status: 1 });

export const Nurse = mongoose.model("Nurse", NurseSchema);
