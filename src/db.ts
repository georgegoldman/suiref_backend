import { MongoClient, Db } from "npm:mongodb@6.1.0";
import { DATABASE_URL } from "./util/constants.ts";

// mongodb://root:secret@localhost:27017/?authSource=admin



export async function init_db(): Promise<Db> {
    const client = new MongoClient(DATABASE_URL);
    const connectClient = await client.connect();
    connectClient.on('connectionCreated', () => {
        console.info("DB init 🚀")
    });
    const suirefDB = await client.db("suiref");
    return suirefDB
}