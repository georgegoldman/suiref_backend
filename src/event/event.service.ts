// deno-lint-ignore-file no-explicit-any

import { Collection, Db, ObjectId } from "mongodb";
import { Event, Leaderboard } from "./event.interface.ts"

export class EventService {
    private readonly eventCollection: Collection<Event>;
    private readonly leaderboardCollection: Collection<Leaderboard>;
    constructor(private readonly db: Db) {
        this.eventCollection = db.collection<Event>('event');
        this.leaderboardCollection = db.collection<Leaderboard>('leaderboard')
    }

    async createEvent(event: Event):Promise<any> {
        const recordExist = await this.eventCollection.findOne(
                {
                    ...event
                }
        );
        if (recordExist) throw new Error("Record already exist");
        const newEvent = await this.eventCollection.insertOne(event);
        return newEvent;
    }

    async getAllEvent():Promise<any> {
        const result = await this.eventCollection.find().toArray();
        return result;
    }

    async getEvent(id: string): Promise<any> {
        const record = await this.eventCollection.findOne(
            { _id: new ObjectId(id)}
        )
        return record;
    }

    async editEvent(id: string, updatedRecord: Event): Promise<any> {
        // check is the record exist
        const record = await this.eventCollection.findOne({ _id: new ObjectId(id)});
        if (record === null) throw new Error("Event Record does not exist!");
        const result  = await this.eventCollection.updateOne(
            {_id: record._id},
            {$set:{...updatedRecord}}
        );
        return result;
    }

    async deleteEvent(id: string): Promise<any> {
        const record = await this.eventCollection.findOne({_id: new ObjectId(id)});
        if (record === null ) throw new Error("Event record does not exist");
        const result = await this.eventCollection.deleteOne({
            _id: record._id
        });
        return result;
    }
}