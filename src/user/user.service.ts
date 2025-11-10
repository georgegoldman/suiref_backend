// deno-lint-ignore-file no-explicit-any
import { Collection, Db, ObjectId } from "mongodb";
import { User } from "./user.interface.ts";

export class UserService {
    private readonly userCollection: Collection<User>;
    constructor(private readonly db: Db) {
        this.userCollection = db.collection<User>('user');
    }

    async createUser(user: User):Promise<any> {
        // check if the user already exist
        const u = await this.userCollection.findOne({
            username: user.username
        })
        // complain if this username exist
        if (u) throw new Error(`user already taken`)
        const newUser = await this.userCollection.insertOne(user);
        return newUser;
    }

    async getUser(id: string):Promise<any> {
        const record = await this.userCollection.findOne(
            {_id: new ObjectId(id)}
        )
        // complain if user does not exist
        if (!record) throw new Error("undefined user")
        return record
    }

    async getUserByUsername(username: string): Promise<any> {
        const record = await this.userCollection.findOne({username});
        if (!record) throw new Error("User lookup failed: record not found.");
        return record
    }

    async getAllUsers():Promise<any> {
        return await this.userCollection.find().toArray();
    }

    async editUser(id: string, updatedRecord: User): Promise<any> {
        // check this u on record
        const u = await this.userCollection.findOne({_id: new ObjectId(id)});
        if (!u) throw new Error(`no such record`);
        // update record
        const result = await this.userCollection.updateOne(
            {_id: u._id},
            {...updatedRecord}
        );
        return result
    }

    async removeUser(id: string): Promise<any> {
        const d = await this.userCollection.findOne({_id: new ObjectId(id)});
        if (!d) throw new Error(`no such record`);
        const result = await this.userCollection.deleteOne({
            _id: d._id
        });
        return result;
    }
}