const firebaseApp = require("firebase/app");
const firebaseStorage = require("firebase/storage");
const multer = require("multer");

firebaseApp.initializeApp({
  apiKey: "AIzaSyBVqKZMtYANZ6b4R9aZ7WTPqrIoC-3TLTo",
  authDomain: "blog-501fd.firebaseapp.com",
  projectId: "blog-501fd",
  storageBucket: "blog-501fd.appspot.com",
  messagingSenderId: "90022978968",
  appId: "1:90022978968:web:b0b7575cb6fbd5ae0df7ed",
  measurementId: "G-4YTBHH5PNG"
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
