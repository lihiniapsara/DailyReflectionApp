const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "apsaralihini11@gmail.com",
    pass: process.env.EMAIL_PASS || "vbjajvqufteixuvf",
  },
});

// Send OTP Function
exports.sendOTP = functions.https.onCall(async (data, context) => {
  const email = data.email?.toLowerCase().trim();

  if (!email) {
    throw new functions.https.HttpsError("invalid-argument", "Email is required");
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000);

    await db.collection("otps").doc(email).set({
      otp,
      expiresAt,
      createdAt: admin.firestore.Timestamp.now(),
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || "apsaralihini11@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset</h2>
          <p>Your OTP for resetting your password is:</p>
          <h3 style="color: #374151;">${otp}</h3>
          <p>This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
          <p>Thank you,<br>Daily Reflection Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error in sendOTP:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Failed to send OTP. Please try again."
    );
  }
});

// Verify OTP and Reset Password Function
exports.verifyOTPAndResetPassword = functions.https.onCall(async (data, context) => {
  const { email, otp, newPassword } = data;

  if (!email || !otp || !newPassword) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email, OTP, and new password are required"
    );
  }

  if (newPassword.length < 8) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Password must be at least 8 characters long"
    );
  }

  try {
    const otpDoc = await db.collection("otps").doc(email.toLowerCase().trim()).get();

    if (!otpDoc.exists) {
      throw new functions.https.HttpsError("not-found", "OTP not found");
    }

    const otpData = otpDoc.data();
    const currentTime = admin.firestore.Timestamp.now();

    if (otpData.otp !== otp) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid OTP");
    }

    if (currentTime.toMillis() > otpData.expiresAt.toMillis()) {
      throw new functions.https.HttpsError("deadline-exceeded", "OTP has expired");
    }

    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password: newPassword });

    await db.collection("otps").doc(email.toLowerCase().trim()).delete();

    return { success: true };
  } catch (error) {
    console.error("Error in verifyOTPAndResetPassword:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "OTP verification failed. Please try again."
    );
  }
});