// deno-lint-ignore-file no-explicit-any

import { Collection, Db, ObjectId } from "mongodb";
import { Attending, Event, Leaderboard } from "./event.interface.ts"
import { UserService } from "../user/user.service.ts";


export class EventService  {
    private readonly eventCollection: Collection<Event>;
    private readonly leaderboardCollection: Collection<Leaderboard>;
    private readonly userService: UserService;
    constructor(private readonly db: Db) {
        this.eventCollection = db.collection<Event>('event');
        this.leaderboardCollection = db.collection<Leaderboard>('leaderboard')
        this.userService = new UserService(db);
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

    async joinEvent(eventId:string, username: string, referrer?: string): Promise<any> {
        if (username == referrer) throw new Error("Self-reference is not allowed.")
        const e = await this.eventCollection.findOne({_id: new ObjectId(eventId)}); // get the event
        if (!e) throw new Error("No such event");
        
        const uByu = await this.userService.getUserByUsername(username);
        if (!uByu) throw new Error("No matching user record found.");

        const already = await this.eventCollection.findOne({
            _id: new ObjectId(eventId),
            "attending.username": username
        });
        if (already) throw new Error("Duplicate attendance detected.");

        
        const ue = await this.eventCollection.updateOne(
            { _id: new ObjectId(eventId) },
            { $push: { attending: { username, referrer, eventId: new ObjectId(eventId) } } }
        );
        if (ue.matchedCount === 0) throw new Error("No matching user record found.");
        else if (ue.modifiedCount === 0) if(referrer) await this.addPoint(referrer, eventId);
        return ue
    }

    async removeAttendee(eventId: string, username: string): Promise<any> {
        const r = await this.eventCollection.updateOne({_id: new ObjectId(eventId)},
            {$pull: {attending: {username}}}
        );
        if (r.matchedCount === 0) throw new Error("No such event");
        else if (r.modifiedCount === 0) throw new Error("No such username");
        else if (!r.acknowledged) throw new Error("Remove operation failed");
        return r

    }

    async createLeaderboard(referrer: string, eventId: string): Promise<any>{
        // check if the user already exist on the leaderboard
        const l = await this.leaderboardCollection.findOne(
            {username: referrer}
        );
        // if the user is in the leaderboard throw an error
        if (l) throw new Error("user already exist in leaderboard");
        const nl = await this.leaderboardCollection.insertOne({
            username: referrer,
            point: 1,
            eventId: new ObjectId(eventId)
        });
        if (nl.insertedId){
            // lookup the event
            const e = await this.eventCollection.findOne({_id: new ObjectId(eventId)});
            // is this event existing ?
            if (!e) throw new Error("there is no such event");
            const ue = await this.eventCollection.updateOne(
                {_id: e._id},
                {$set: {leaderBoard: nl.insertedId}}
            );
            if(!ue.acknowledged) throw new Error("Error editing this data");
            return nl
        }
        throw new Error("Unable to create leaderboard");
    }

    async addPoint(referral: string, eventId: string): Promise<any> {
        // check if the lb exist firt of
        
        const lb = await this.leaderboardCollection.findOne({eventId: new ObjectId(eventId)}); // leaderboard
        if (!lb) return this.createLeaderboard(referral, eventId);
        const uInLb = await this.leaderboardCollection.findOne({username: referral, _id: new ObjectId(lb._id)}); // user in leaderbaord
        if (!uInLb) return this.leaderboardCollection.insertOne(
            {username: referral, point: 1, eventId: new ObjectId(eventId)}
        );
        
        const upUInLb  = await this.leaderboardCollection.updateOne( // updated user in leaderboard
            {username: referral, eventId: new ObjectId(eventId)},
            {
                $inc: {point: 1},
                $setOnInsert: { eventId: new ObjectId(eventId), username: referral }
            },
            {upsert: true}
        );
        if(!upUInLb.acknowledged) throw new Error("there is a problem adding points");
        return upUInLb;
    }

    async readAllLeaderboard(): Promise<any> {
        const lb = await this.leaderboardCollection.find().toArray();
        return lb;
    }

    async getAttendingUser(id: string): Promise<any> {
        const event  = await this.eventCollection.findOne({_id: new ObjectId(id)});
        return event?.attending
    }
}