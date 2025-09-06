const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true }); // Add CORS middleware

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'daily-reflection-8068b',
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'apsaralihini11@gmail.com',
    pass: 'zgaorzqgmvsjgvpp',
  },
});

// HTTPS Callable Function for sending OTP
exports.sendOTP = functions.https.onCall(async (data, context) => {
  const { email } = data;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  try {
    // Store OTP in Firestore
    await admin.firestore().collection('otps').doc(email).set({
      otp,
      expiresAt,
      createdAt: Date.now(),
    });

    // Send OTP via email
    await transporter.sendMail({
      from: '"Daily Reflection" <apsaralihini11@gmail.com>', // Fixed 'from' email
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send OTP');
  }
});

// HTTPS Callable Function for verifying OTP and resetting password
exports.verifyOTPAndResetPassword = functions.https.onCall(async (data, context) => {
  const { email, otp, newPassword } = data;

  try {
    const otpDoc = await admin.firestore().collection('otps').doc(email).get();
    if (!otpDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'OTP not found or expired');
    }

    const { otp: storedOTP, expiresAt } = otpDoc.data();
    if (Date.now() > expiresAt) {
      throw new functions.https.HttpsError('deadline-exceeded', 'OTP has expired');
    }

    if (otp !== storedOTP) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid OTP');
    }

    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password: newPassword });

    await admin.firestore().collection('otps').doc(email).delete();

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to verify OTP');
  }
});

// Optional: Add a direct HTTPS endpoint with CORS support (for debugging or alternative use)
exports.sendOTPViaHttp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    try {
      await admin.firestore().collection('otps').doc(email).set({
        otp,
        expiresAt,
        createdAt: Date.now(),
      });

      await transporter.sendMail({
        from: '"Daily Reflection" <apsaralihini11@gmail.com>',
        to: email,
        subject: 'Your OTP for Password Reset',
        text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
      });

      res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
  });
});