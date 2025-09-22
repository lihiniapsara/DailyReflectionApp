import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();
const db = admin.firestore();

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.user,
    pass: functions.config().gmail.pass,
  },
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// =============================
// Send OTP (Only Function)
// =============================
export const sendOTP = functions.https.onCall(async (data, context) => {
  const email = data?.email?.toLowerCase().trim();

  if (!email) {
    throw new functions.https.HttpsError("invalid-argument", "Email required");
  }

  const otp = generateOTP();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

  await db.collection("otp").doc(email).set({ otp, expiry });

  const mailOptions = {
    from: functions.config().gmail.user,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, otp }; // otp return කරන්න ඕන නම් දාන්න, නැත්නම් දාල නෑ
  } catch (err: any) {
    console.error("sendOTP error:", err);
    throw new functions.https.HttpsError("internal", "Failed to send OTP");
  }
});
