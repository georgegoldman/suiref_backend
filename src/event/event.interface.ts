import { ObjectId } from "mongodb";

export interface Event {
    // id: string | undefined,
    name: string,
    startTime: Date,
    endTime: Date,
    eventLocaction: string,
    description: string,
    free: boolean,
    requireApproval: boolean,
    capacity: number,
    imageUrl: string,
    leaderBoard?: ObjectId // referral leaderboard
}

export interface Leaderboard {
    username: string,
    point: number,
    eventId: ObjectId
}

export interface EventNFT {
    id: string,
    name: string,
    description: string,
    project_url: string,
    category: string,
    image_url: string,
    rank: number,
    eventId: string
}