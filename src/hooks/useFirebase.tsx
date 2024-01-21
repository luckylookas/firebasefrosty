import {useEffect, useState} from "react";
import {initializeApp} from "firebase/app";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {credentials, firebaseConfig} from "../firebaseconfig";
import {FirebaseApp} from "@firebase/app";

export const useFirebase = () => {
    const [firebaseApp, setApp] = useState<FirebaseApp>()

    useEffect(() => {
        if (!firebaseApp) {
            const auth = getAuth(initializeApp(firebaseConfig))
            signInWithEmailAndPassword(auth, credentials.username, credentials.password)
                .then(() => setApp(auth.app))
                .catch((e) => console.log(e))
        }
    }, [firebaseApp])

    return firebaseApp
}
