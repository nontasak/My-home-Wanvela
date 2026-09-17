import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// ป้องกันปัญหา ISP ในประเทศไทยบล็อกโดเมน *.firebaseapp.com จนเกิด ERR_CONNECTION_RESET
// โดยบังคับใช้ *.web.app หรือ custom domain ที่กำหนดไว้
const safeAuthDomain = (!firebaseConfig.authDomain || firebaseConfig.authDomain.includes('firebaseapp.com'))
  ? `${firebaseConfig.projectId}.web.app`
  : firebaseConfig.authDomain;

const app = initializeApp({
  ...firebaseConfig,
  authDomain: safeAuthDomain
});
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
