import {useCallback, useEffect, useMemo, useState} from "react";
import {
    FirebaseSession,
    FirebaseSessionMonster,
    hydrateSessionMonster,
    Monster,
    newSessionMonster, NORMAL, Rank,
    SessionMonster
} from "../model/model";
import {FirebaseApp} from "@firebase/app";
import {
    writeBatch,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    getFirestore,
    query,
    setDoc,
    SnapshotOptions,
} from 'firebase/firestore';
import {monsterConverter} from "./useSearch";

const SESSION_COLLECTION = `sessionv2`;

const SESSION_ID = `lukas`;


const sessionConverter = {
    toFirestore: (session: FirebaseSession) => {
        return {...session}
    },

    fromFirestore: (snapshot: DocumentData, options: SnapshotOptions): FirebaseSession => {
        const data = snapshot.data(options)!;
        return {
            ...data
        } as FirebaseSession;
    }
}

const sessionMonsterConverter = {
    toFirestore: (sessionMonster: SessionMonster) => {
        return {
            id: sessionMonster.id,
            color: sessionMonster.color,
            level: sessionMonster.level,
            rank: sessionMonster.rank,
            tokenHp: sessionMonster.tokenHp,
            monsterRef: sessionMonster.monsterRef,
        } as FirebaseSessionMonster;
    },
    fromFirestore: (snapshot: DocumentData, options: SnapshotOptions): FirebaseSessionMonster => {
        const data = snapshot.data(options)!;
        return {
            ...data
        } as FirebaseSessionMonster;
    }
};


export const useSession = (app: FirebaseApp | undefined) => {
    const [session, setSession] = useState<FirebaseSession>()
    const [list, setList] = useState<SessionMonster[]>([])

    const db = useMemo(() => app ? getFirestore(app) : undefined, [app])

    const refresh = useCallback(async () => {
        if (!db) {
            return
        }

        const _session = await getDoc(doc(db, SESSION_COLLECTION, SESSION_ID).withConverter(sessionConverter)).then(it => it.data())

        if (!_session) {
            return
        }

        setSession(_session)

        const monsters = await getDocs(
            query(collection(db, _session.monstersRef))
                .withConverter(sessionMonsterConverter)
        ).then(it => it.docs.map(d => d.data()))

        const hydrated = await Promise.all(monsters.map(async (hit) =>
            hydrateSessionMonster(await getDoc(doc(db, hit.monsterRef).withConverter(monsterConverter)).then(it => it.data() as Monster), hit)
        ))

        setList(hydrated)
    }, [db])

    const newSession = useCallback((level: number) => {
        if (db) {
            setDoc(doc(db, SESSION_COLLECTION, SESSION_ID), {
                level,
                monstersRef: `${SESSION_COLLECTION}/${SESSION_ID}/monsters`,
                fire: 0,
                ice: 0,
                earth: 0,
                wind: 0,
                dark: 0,
                light: 0,
            })
                .then(() =>
                    getDocs(
                        query(collection(db, SESSION_COLLECTION, SESSION_ID, `monsters`))
                            .withConverter(sessionMonsterConverter)
                    ).then(it => it.docs.map(d => d.data()))
                )
                .then(monsters => {
                    const batch = writeBatch(db);
                    monsters.map(m => doc(db, SESSION_COLLECTION, SESSION_ID, `monsters`, m.id)).forEach(it => batch.delete(it))
                    return batch.commit()
                })
                .then(refresh)
                .catch(refresh)
        }
    }, [db, refresh])

    useEffect(() => {
        refresh().catch(e => console.log(e))
    }, [refresh])

    //subscribe to changes on session-monsters -> refresh

    const add = useCallback((monster: Monster) => {
        if (!session || !db) {
            return
        }
        setDoc(doc(db, session.monstersRef, monster.id).withConverter(sessionMonsterConverter), newSessionMonster(monster, session.level)).then(refresh)

    }, [session, db, refresh])

    const remove = useCallback((monster: Monster) => {
        if (!session || !db) {
            return
        }
        deleteDoc(doc(db, session.monstersRef, monster.id)).then(refresh)
    }, [db, refresh, session])


    const createToken = useCallback((monster: SessionMonster, rank: Rank, token: number) => {
        if (!session || !db) {
            return
        }
        setDoc(doc(db, session.monstersRef, monster.id).withConverter(sessionMonsterConverter), {
            ...monster,
            rank: monster.rank.map((original, index) => index === token-1 ? rank : original),
            tokenHp: monster.tokenHp.map((original, index) => index === token-1 ? monster.monster.hp[2*monster.level+rank] : original),
        } as SessionMonster).then(refresh)
    }, [db, session, refresh])

    const removeToken = useCallback((monster: SessionMonster, token: number) => {
        if (!session || !db) {
            return
        }

        setDoc(doc(db, session.monstersRef, monster.id).withConverter(sessionMonsterConverter), {
            ...monster,
            rank: monster.rank.map((original, index) => index === token-1 ? NORMAL : original),
            tokenHp: monster.tokenHp.map((original, index) => index === token-1 ? 0 : original),
        } as SessionMonster).then(refresh)
    }, [db, session, refresh])


    const setTokenHp = useCallback((monster: SessionMonster, token: number, nextHp: number) => {
        if (!session || !db) {
            return
        }

        if (nextHp > monster.monster.hp[2*monster.level+monster.rank[token-1]]) {
            nextHp = monster.monster.hp[2*monster.level+monster.rank[token-1]];
        }
        if (nextHp < 0) {
            nextHp = 0;
        }

        setDoc(doc(db, session.monstersRef, monster.id).withConverter(sessionMonsterConverter), {
            ...monster,
            tokenHp: monster.tokenHp.map((original, index) => index === token-1 ? nextHp : original),
        } as SessionMonster)
            .then(refresh)
    }, [db, session, refresh])


    return {add, remove, list, newSession, createToken,removeToken, setTokenHp}

    // useEffect(() => {
    //     if (db) {
    //         getDocs(query(collection(db, `monsters`))).then(docs => {
    //             if(docs.docs.length === 0) {
    //                 return getDocs(query(collection(db, `monsters-1`)).withConverter(monsterConverter)).then(docs => {
    //                     docs.forEach(monster => {
    //                         Promise.all([
    //                             getDoc(doc(db, "monsters-2", monster.id).withConverter(monsterConverter)),
    //                             getDoc(doc(db, "monsters-3", monster.id).withConverter(monsterConverter)),
    //                             getDoc(doc(db, "monsters-4", monster.id).withConverter(monsterConverter)),
    //                             getDoc(doc(db, "monsters-5", monster.id).withConverter(monsterConverter)),
    //                             getDoc(doc(db, "monsters-6", monster.id).withConverter(monsterConverter)),
    //                             getDoc(doc(db, "monsters-7", monster.id).withConverter(monsterConverter)),
    //                         ]).then(monsters =>
    //                             setDoc(doc(db, "monsters", monster.id),
    //                                 [monster.data(), ...monsters.map(it => it.data()!)]
    //                                     .reduce(
    //                                         (prev: FireBaseMonster, next: FireBaseMonster) => {
    //                                             if (!next || !next.hp) {
    //                                                 return {
    //                                                     ...prev,
    //                                                     hp: [...prev.hp, 0,0],
    //                                                     armor: [...prev.armor,  0,0],
    //                                                     attack: [...prev.attack, 0,0],
    //                                                     retaliate: [...prev.retaliate,  0,0],
    //                                                     special: [...prev.special,  '',''],
    //                                                     speed: [...prev.speed,  0,0],
    //                                                 }
    //                                             }
    //                                             return {
    //                                                 ...prev,
    //                                                 hp: [...prev.hp, ...next.hp],
    //                                                 armor: [...prev.armor, ...next.armor],
    //                                                 attack: [...prev.attack, ...next.attack],
    //                                                 retaliate: [...prev.retaliate, ...next.retaliate],
    //                                                 special: [...prev.special, ...next.special],
    //                                                 speed: [...prev.speed, ...next.speed],
    //                                             }
    //                                         },
    //                                         {
    //                                             ...monster.data() //level 0 placeholder
    //                                         } as FireBaseMonster
    //                                     ))
    //                         )
    //                     })
    //                 })
    //
    //             } else {
    //                 console.log("already filled collection")
    //             }
    //         }).catch(e => console.log("OHHH NOOOO", e))
    //         }}, [db])


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
