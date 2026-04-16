import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 환경 변수 설정
const ENV_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const ENV_DATABASE_ID = import.meta.env.VITE_FIREBASE_DATABASE_ID;

// "slp-docs"는 프로젝트 이름일 뿐 데이터베이스 ID로는 부적절하므로 배제합니다.
const isInvalidDbId = (id: string | undefined) => !id || id === 'slp-docs' || id === '';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAPc36awDxHcFuzQTW_sNvbvJTliF48acQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0159907695.firebaseapp.com",
  projectId: (ENV_PROJECT_ID && ENV_PROJECT_ID !== 'slp-docs') ? ENV_PROJECT_ID : "gen-lang-client-0159907695",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0159907695.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "420938473723",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:420938473723:web:41a59d5b4fa8e77696505e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
  firestoreDatabaseId: isInvalidDbId(ENV_DATABASE_ID) ? "(default)" : ENV_DATABASE_ID,
};

console.log('[FIREBASE_DEBUG] Initializing with:', {
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId,
  isProd: import.meta.env.PROD
});

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
