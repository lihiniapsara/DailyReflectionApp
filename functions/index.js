import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import * as corsLib from "cors";

admin.initializeApp();
const db = admin.firestore();
const cors = corsLib({ origin: true });

// Example onRequest
export const sendOTP = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;

    await db.collection("otp").doc(email).set({ otp, expiry });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: functions.config().gmail.user,
        pass: functions.config().gmail.pass,
      },
    });

    await transporter.sendMail({
      from: functions.config().gmail.user,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    });

    return res.json({ success: true });
  });
});
