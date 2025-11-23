import { createContext, useEffect, useReducer } from 'react';
import { firebase } from './Firebase';

export interface InitialStateType {
  isAuthenticated?: boolean;
  isInitialized?: boolean;
  user?: any | null | undefined;
}

const initialState: InitialStateType = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const reducer = (state: InitialStateType, action: any) => {
  if (action.type === 'AUTH_STATE_CHANGED') {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  }

  return state;
};

const AuthContext = createContext<any | null>({
  ...initialState,
  platform: 'Firebase',
  signup: () => Promise.resolve(),
  signin: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  onceGetUsers: () => Promise.resolve(),
  CreateUser: () => Promise.resolve(),
});

export const AuthProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(
    () =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
          // Save user to database if not exists
          try {
            const userRef = firebase.database().ref(`users/${user.uid}`);
            const snapshot = await userRef.once('value');
            
            if (!snapshot.exists()) {
              // Create user in database
              await userRef.set({
                username: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email,
                avatar: user.photoURL,
                createdAt: new Date().toISOString(),
              });
              console.log('User data saved to database:', user.uid);
            }
          } catch (error) {
            console.error('Error saving user to database:', error);
          }

          // Here you should extract the complete user profile to make it available in your entire app.
          // The auth state only provides basic information.
          dispatch({
            type: 'AUTH_STATE_CHANGED',
            payload: {
              isAuthenticated: true,
              user: {
                id: user.uid,
                avatar: user.photoURL,
                email: user.email,
                displayName: user.displayName,
              },
            },
          });
        } else {
          dispatch({
            type: 'AUTH_STATE_CHANGED',
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      }),
    [dispatch],
  );

  // Login with FB

  const loginWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    return firebase.auth().signInWithPopup(provider);
  };

  // Login with FB
  const loginWithFaceBook = () => {
    const provider = new firebase.auth.FacebookAuthProvider();

    return firebase.auth().signInWithPopup(provider);
  };

  const loginWithTwitter = () => {
    const provider = new firebase.auth.TwitterAuthProvider();

    return firebase.auth().signInWithPopup(provider);
  };

  // Sign Up
  const signup = async (email: string, password: string) => {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    if (userCredential.user) {
      // Save user to database
      await firebase.database().ref(`users/${userCredential.user.uid}`).set({
        username: email.split('@')[0],
        email: email,
        createdAt: new Date().toISOString(),
      });
    }
    return userCredential;
  };

  // Sign In
  const signin = (email: string, password: string) =>
    firebase.auth().signInWithEmailAndPassword(email, password);

  // Sign out
  const logout = () => firebase.auth().signOut();
  const CreateUser = (id: string, username: string, email: string) =>
    firebase.database().ref(`users/${id}`).set({
      username,
      email,
    });
  const onceGetUsers = () => firebase.database().ref('users').once('value');

  return (
    <AuthContext.Provider
      value={{
        ...state,
        platform: 'Firebase',
        signup,
        signin,
        CreateUser,
        onceGetUsers,
        loginWithGoogle,
        loginWithFaceBook,
        loginWithTwitter,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
