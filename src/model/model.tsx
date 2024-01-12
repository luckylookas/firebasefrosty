
const NORMAL = 0;
const ELITE = 1;

export function getId(monster: Monster): string {
   return `${monster.name.toLowerCase().replace(" ", "")}`
}

export interface FireBaseMonster extends Monster{
    ftsTokens: string[]
}

export interface Monster {
    id: string
    name: string
    hp: number[]
    tokens: number
    attack: number[]
    armor: number[]
    retaliate: number[]
    speed: number[]
    special: string[]
}

export interface SessionMonster {
    id: string
    color: string
    monsterRef: string
    tokenHp: number[]
    tokenStats: number[]
}

function newSessionMonster(monster: Monster, level: number): SessionMonster {
    return {
        id: monster.id,
        color: '#000000',
        monsterRef: `monsters-${level}/${monster.id}`,
        tokenHp: Array.from(Array(monster.tokens).keys()).map(index => 0),
        tokenStats: Array.from(Array(monster.tokens).keys()).map(index => NORMAL),
    } as SessionMonster
}