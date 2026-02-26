require("dotenv").config();
const firebaseApp = require("firebase/app");
const firebaseStorage = require("firebase/storage");
const multer = require("multer");

firebaseApp.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
});

const storage = firebaseStorage.getStorage();
const uploadMulter = multer({ storage: multer.memoryStorage() });

const uploadToFierbase = async (file, userId, usertype, filetype) => {
  try {
    let dashpath;
    if (usertype === "user" && filetype === "profile") {
      dashpath = `user/profile/${file.originalname}-${new Date().getTime()}`;
    } else if (usertype === "userPost" && filetype === "blogimages") {
      dashpath = `userPost/${userId}/blogimages/${file.originalname}-${new Date().getTime()}`;
    }else if (usertype === "Advertisement" && filetype === "AdPoster") {
      dashpath = `user/advertisement/${file.originalname}-${new Date().getTime()}`;
    }
    const storageRef = firebaseStorage.ref(storage, dashpath);
    const metadata = {
      contentType: file.mimetype,
    };

    const snapshot = await firebaseStorage.uploadBytes(
      storageRef,
      file.buffer,
      metadata
    );
    const downloadURL = await firebaseStorage.getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading to Firebase Storage:", error);
    throw error;
  }
};

const deleteFileFromFirebase = async (fileName) => {
  try {
    const storageRef = firebaseStorage.ref(storage, fileName);
    await firebaseStorage.deleteObject(storageRef);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadToFierbase,
  uploadMulter,
  deleteFileFromFirebase,
};
