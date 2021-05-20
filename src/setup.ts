import dotenv from "dotenv"
import {connect} from "./utils/db";
(async()=>{
    console.log("connecting to database...")
    const db = await connect();
    console.log("connected to database!")
    console.log("creating collection badUsers...")
    db.createCollection("badUsers");
    console.log("created collection badUsers!")
    console.log("creating collection info...")
    db.createCollection("info");
    console.log("created collection info!")
    console.log("creating collection users...")
    db.createCollection("users");
    console.log("created collection users!")
    console.log("inserting fresh info data...")
    const info = await db.collection("info");
    info.insertOne({
        lastUsernameScraped:"0",
        lastUpdated:Date.now()
    });
    console.log("done");
})()