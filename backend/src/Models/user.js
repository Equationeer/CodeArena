const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50, // Increased from 15 to allow full names
      trim: true,
    },
    lastName: {
      type: String,
      maxLength: 50,
      trim: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      immutable: true,
    },
    age: {
      type: Number,
      min: 5,
      max: 70,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    problemSolved: [
      {
        type: Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose.model("submission").deleteMany({ userId: doc._id });
  }
});

const User = mongoose.model("user", userSchema);
module.exports = User;