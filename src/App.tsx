import React from 'react';
import './App.css';
import {Search} from "./components/search/search";
import {useSearch} from "./hooks/useSearch";
import {useFirebase} from "./hooks/useFirebase";
import {useSession} from "./hooks/useSession";
import {ELITE, NORMAL, Rank} from "./model/model";


function App() {
    const firebaseApp = useFirebase();
    const search = useSearch(firebaseApp);
    const session = useSession(firebaseApp);
    const colors = ['bg-red', 'bg-green', 'bg-blue', 'bg-purple']

    if (!firebaseApp) {
        return <div className='w-screen h-screen'>...</div>
    }

    return <div className='w-screen h-screen'>
        <button onClick={() => session.newSession(1)}>new session</button>
        <Search {...search} onResultClick={session.add}/>

        <div className='leading-none flex flex-row gap-5 select-none'>
            {session.list.map((monster, index) =>
                <ol className='flex flex-col gap-1 flex-1'>
                    <li className='flex flex-col gap-2 flex-1'>
                        <h2 onClick={() => session.remove(monster.monster)} className='text-4xl text-center cursor-pointer hover:line-through'>{monster.monster.name}</h2>
                        <ol className={`${colors[index%4]} text-4xl`}>
                            {monster.tokens.map((token, index) =>
                                <li className={`p-2 ${token.rank === ELITE ? ' bg-elite' : 'bg-transparent'} flex flex-row gap-2`}>
                                    <span
                                        onClick={() => {
                                            if (!token.hp) {
                                                session.createToken(monster, NORMAL, index+1)
                                            }
                                            else if (token.hp && token.rank === NORMAL) {
                                                session.createToken(monster, ELITE, index+1)
                                            } else {
                                                session.removeToken(monster, index+1)
                                            }
                                        }}
                                        className={`flex-auto basis-2/6 text-center cursor-pointer bg-transparent ${token.hp ? 'border-e-2' : ''} border-main border-solid rounded-none`}>{index + 1}</span>
                                    {token.hp ? <span className={`basis-4/6 flex-auto w1 bg-transparent flex flex-row ${token.rank === ELITE ? 'bg-elite' : 'bg-transparent'} justify-center content-center`}>

                                        <span className='basis-1/2 bg-inherit text-center'>{token.hp}</span>
                                        <span className='basis-1/2 bg-inherit text-center'>/</span>
                                        <span className='basis-1/2 bg-inherit text-center'>{token.maxHp}</span>
                                        <span className='basis-1/6 bg-inherit text-center cursor-pointer' onClick={() => session.setTokenHp(monster, index+1, token.hp+1)}>+</span>
                                        <span className='basis-1/6 bg-inherit text-center cursor-pointer' onClick={() => session.setTokenHp(monster, index+1, token.hp-1)}>-</span>
                                    </span> : null}

                                </li>)}
                        </ol>
                    </li>
                </ol>
            )}
        </div>

    </div>
}

export default App;
