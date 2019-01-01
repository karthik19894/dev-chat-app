import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/database';

var config = {
	apiKey: 'AIzaSyBYmDhY2TSATwnaWnIrTpfMqYzEd-rNeDE',
	authDomain: 'karthik-chat.firebaseapp.com',
	databaseURL: 'https://karthik-chat.firebaseio.com',
	projectId: 'karthik-chat',
	storageBucket: 'karthik-chat.appspot.com',
	messagingSenderId: '785847441143',
};
firebase.initializeApp(config);

export default firebase;
