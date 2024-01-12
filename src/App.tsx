import React from 'react';
import './App.css';
import {useFirebase} from "./hooks/useFirebase";
import {Login} from "./components/login";
import {Search} from "./components/search/search";

function App() {
    const {performLogin, ready, search, searchResults} = useFirebase()

return <div className='w-screen h-screen'>
    {!ready && <Login performLogin={performLogin} /> }
    {ready && <div className='form'>
       <Search search={(term) => search(term, 1)} results={searchResults} />
    </div> }

</div>
}

export default App;
