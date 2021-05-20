import {Db, MongoClient} from "mongodb";

export const connect = () : Promise<Db> => new Promise((resolve,reject)=>{
    MongoClient.connect(process.env.DB_URL, (err, _client)=>{
        if (err) reject(err);
        resolve(_client.db("spotify"))
    });
});


