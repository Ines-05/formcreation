import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://inestchekpo5_db_user:WesyDPmLB8boYH3P@cluster0.4gqw7u2.mongodb.net/?appName=Cluster0";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB");
        const dbs = await client.db().admin().listDatabases();
        console.log("Databases:", dbs.databases.map(db => db.name));
    } catch (err) {
        console.error("Connection error:", err);
    } finally {
        await client.close();
    }
}

run();
