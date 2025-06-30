// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDjdugOb3r6B2DPsg4fGMZ6RrTQjDKUKqQ",
  authDomain: "capstoneproject-hast.firebaseapp.com",
  projectId: "capstoneproject-hast",
  storageBucket: "capstoneproject-hast.firebasestorage.app",
  messagingSenderId: "831512899464",
  appId: "1:831512899464:web:dd19ff602a343b7f9b543d",
  measurementId: "G-Y059CVPGQH"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// (Tuỳ chọn) Xử lý khi push đến:
messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
