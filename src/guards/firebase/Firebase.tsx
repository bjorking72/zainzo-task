// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBW1NmcIZmrvtZmbYj8qU0tZOvDYYTasBE',
  authDomain: 'grafistix777.firebaseapp.com',
  projectId: 'grafistix777',
  storageBucket: 'grafistix777.firebasestorage.app',
  messagingSenderId: '1074217729888',
  appId: '1:1074217729888:web:e8e8da14b38765c1de2805',
  measurementId: 'G-ECCBS2NC6V',
  databaseURL: 'https://grafistix777-default-rtdb.firebaseio.com/',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const Db = firebase.database();
const Auth = firebase.auth();
const Firestore = firebase.firestore();

export { Db, Auth, Firestore, firebase };
