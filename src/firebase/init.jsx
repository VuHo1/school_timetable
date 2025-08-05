
import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';
import { Toaster, toast } from 'react-hot-toast';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjdugOb3r6B2DPsg4fGMZ6RrTQjDKUKqQ",
  authDomain: "capstoneproject-hast.firebaseapp.com",
  projectId: "capstoneproject-hast",
  storageBucket: "capstoneproject-hast.appspot.com",
  messagingSenderId: "831512899464",
  appId: "1:831512899464:web:dd19ff602a343b7f9b543d",
  measurementId: "G-Y059CVPGQH"
};

const firebaseApp = initializeApp(firebaseConfig);

const messaging = getMessaging(firebaseApp);

const listenToForegroundMessage = () => {
  onMessage(messaging, (payload) => {
    console.log('[FCM] Tin nhắn foreground:', payload);
    const title = payload?.notification?.title || 'Thông báo';
    const body = payload?.notification?.body || '';
    toast.success(
      <div>
        <strong>{title}</strong>
        <div>{body}</div>
      </div>
    );

  });
};

export { messaging, listenToForegroundMessage };