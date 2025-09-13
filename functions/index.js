const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// Configure Nodemailer (example for Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "apsaralihini11@gmail.com",
    pass: "vbjajvqufteixuvf",
  },
});


// Send OTP Function
exports.sendOTP = functions.https.onCall(async (data, context) => {
  const email = data.email;

  if (!email) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email is required"
    );
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    if (!user) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await db.collection("otps").doc(email).set({
      otp: otp,
      expiresAt: expiresAt,
      createdAt: Date.now(),
    });

    const mailOptions = {
      from: "apsaralihini11@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error in sendOTP:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Failed to send OTP"
    );
  }
});

// Verify OTP and Reset Password Function
exports.verifyOTPAndResetPassword = functions.https.onCall(
  async (data, context) => {
    const { email, otp, newPassword } = data;

    if (!email || !otp || !newPassword) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email, OTP, and new password are required"
      );
    }

    try {
      const otpDoc = await db.collection("otps").doc(email).get();

      if (!otpDoc.exists) {
        throw new functions.https.HttpsError("not-found", "OTP not found");
      }

      const otpData = otpDoc.data();
      const currentTime = Date.now();

      if (otpData.otp !== otp) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid OTP");
      }

      if (currentTime > otpData.expiresAt) {
        throw new functions.https.HttpsError(
          "deadline-exceeded",
          "OTP has expired"
        );
      }

      const user = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(user.uid, { password: newPassword });

      await db.collection("otps").doc(email).delete();

      return { success: true };
    } catch (error) {
      console.error("Error in verifyOTPAndResetPassword:", error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "OTP verification failed"
      );
    }
  }
);
