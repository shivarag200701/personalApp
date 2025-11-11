import {redisClient} from "../../index.ts";

// state data to be stored in redis between google oauth and our server
export interface StateData {
    type: 'login' | 'connect';      // later to support calender async
    userId?: number;
    timestamp: number;
}

const STATE_PREFIX = 'oauth:state:';
const STATE_TTL = 10 * 60; 


export async function setState(state: string, data: StateData): Promise<void> {
    const key = `${STATE_PREFIX}${state}`;
    await redisClient.setEx(key, STATE_TTL, JSON.stringify(data));
}

export async function getState(state: string): Promise<StateData | null>{
    const key = `${STATE_PREFIX}${state}`;
    const data = await redisClient.get(key);

    if(!data){
        return null;
    }
    try {
        return JSON.parse(data) as StateData;
    } catch (error) {
        console.error("Error parsing state data:", error);
        return null;
    }
}

export async function deleteState(state: string): Promise<void> {
    const key = `${STATE_PREFIX}${state}`;
    await redisClient.del(key);
}