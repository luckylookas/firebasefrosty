import React from "react";
import { Monster } from "../../model/model";

interface Props {
    search: (term: string) => void
    results: Monster[];
}

const SearchItem = (item: Monster) => {
    return <div className='p-2 cursor-pointer bg-main hover:bg-light'>{item.name}</div>
}

export const Search = ({search, results}: Props) => {

    return <div className='flex flex-col p-2'>
        <input className='basis-full border-text border-solid border-b-2 rounded-none' placeholder='search...' onChange={e => search(e.target.value)}/>
        {results.length ?
            <div
                className={'basis-full border-text border-solid border-b-2 border-r-2 border-l-2 rounded-e-l-none rounded-e-r-none'}>
                {
                    results.map(item => <SearchItem {...item} />)
                }
            </div> : null
        }
    </div>

}
