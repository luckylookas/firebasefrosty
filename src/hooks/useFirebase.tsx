import {useCallback, useEffect, useMemo, useState} from "react";
import {initializeApp} from "firebase/app";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {DocumentData, collection, getDocs, getFirestore, limit, orderBy, query, SnapshotOptions, where, QuerySnapshot, DocumentSnapshot} from 'firebase/firestore';
import {Monster} from "../model/model";
import {firebaseConfig} from "../firebaseconfig";

//collections:
// monster definitions: `monsters-${level}`
// monsters in session: `session-monsters`
// tokens in session : `session-tokens`

const monsterConverter = {
    toFirestore: (monster: DocumentData) => {
        return {};
    },
    fromFirestore: (snapshot: DocumentData, options: SnapshotOptions): Monster => {
        const data = snapshot.data(options)!;
        return {
            ...data
        } as Monster;
    }
};

export const useFirebase = () => {
    const [login, setLogin] = useState<{ email: string, password: string }>()
    const [searchResults, setSearchResults] = useState<Monster[]>([])


    const auth = useMemo(() => {
        return getAuth(initializeApp(firebaseConfig))
    }, [])

    const ready = useMemo(() => !!auth.currentUser, [auth, auth.currentUser])

    const db = useMemo(() => {
        if (auth) {
            return getFirestore(auth.app)
        }
    }, [auth])

    const performLogin = useCallback((email: string, password: string) => {
        setLogin({email, password})
    }, [])

    useEffect(() => {
        if (auth && login) {
            signInWithEmailAndPassword(auth, login.email, login.password)
                .catch((e) => console.log(e))
        }
    }, [auth, login])

    const search = useCallback((term: string, level: number) => {
        if (db && term && term.length && level) {
            const q = query(collection(db, `monsters-${level}`),
                        where("ftsTokens", "array-contains", term),
                        limit(5))
                .withConverter(monsterConverter);
            getDocs(q).then(hits => {
                setSearchResults(hits.docs.map(it => it.data()))
            })
        } else {
            setSearchResults([]);
        }
    }, [db])

    return {
        ready,
        performLogin,
        search,
        searchResults
    }


    // useEffect(() => {
    //     if (auth && fbApp) {
    //         const db = getFirestore(fbApp);
    //         //used to sub to updates on a query or collection (always send the whole result set, not just updated records)
    //         return onSnapshot(
    //             query(collection(db, "monsters"),
    //             where("name_ngrams", "array-contains", 'alg')),
    //             (hits) => setNames(hits.docs.map(d => d.get('name') as string))
    //         );
    //
    //         // // used to sub to updates on on document (eg sub to a token that exists)
    //         // return onSnapshot(doc(db, "monsters", '<ID>'), (doc) => {
    //         //     console.log("Current data: ", doc.get('name'));
    //         // });
    //
    //     }
    // }, [auth, fbApp])


}