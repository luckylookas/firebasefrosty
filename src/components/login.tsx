import React, {Fragment, useState} from "react";

export const Login = ({performLogin}: {performLogin: (email: string, password: string) => void}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    return <div className='form flex-column'>
        <input placeholder='email' type='text' value={email} onChange={(v) => setEmail(v.target.value)}/>
        <input placeholder='password' type='password' value={password} onChange={(v) => setPassword(v.target.value)}/>
        <button onClick={() => performLogin(email, password)}>ok</button>
    </div>
}