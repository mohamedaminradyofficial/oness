import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// واجهة المستخدم
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

// مخطط المستخدم
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'البريد الإلكتروني غير صحيح']
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
    select: false // لا ترسل كلمة المرور في الاستعلامات العادية
  },
  firstName: {
    type: String,
    required: [true, 'الاسم الأول مطلوب'],
    trim: true,
    maxlength: [50, 'الاسم الأول طويل جداً']
  },
  lastName: {
    type: String,
    required: [true, 'اسم العائلة مطلوب'],
    trim: true,
    maxlength: [50, 'اسم العائلة طويل جداً']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual للاسم الكامل
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method للمقارنة بين كلمة المرور
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method للحصول على الاسم الكامل
UserSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`;
};

// Pre-save middleware لتشفير كلمة المرور
UserSchema.pre('save', async function(next) {
  // فقط قم بتشفير كلمة المرور إذا تم تعديلها
  if (!this.isModified('password')) return next();

  try {
    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// إنشاء index للبحث السريع
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

// إنشاء نموذج المستخدم
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
