import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date;
  punchIn: Date;
  punchOut?: Date;
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  punchIn: {
    type: Date,
    required: true,
    default: Date.now,
  },
  punchOut: {
    type: Date,
  },
  totalHours: {
    type: Number,
    min: 0,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'present',
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Calculate total hours when punch out is set
attendanceSchema.pre('save', function(next) {
  if (this.punchOut && this.punchIn) {
    const diffInMs = this.punchOut.getTime() - this.punchIn.getTime();
    this.totalHours = Math.round((diffInMs / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

export default mongoose.model<IAttendance>('Attendance', attendanceSchema); 