import mongodb from 'mongodb';

export class E14DataBase {
    dbClient: mongodb.MongoClient;
    E14DbPort: mongodb.Db;
    stationsLoad: mongodb.Collection<mongodb.BSON.Document>;
    usersLoad: mongodb.Collection<mongodb.BSON.Document>;
    eventsLoad: mongodb.Collection<mongodb.BSON.Document>;

    constructor() {
        this.dbClient = new mongodb.MongoClient("mongodb+srv://admin:Qc61XNesX9GzCqZR@e14dbcluster.iteglrg.mongodb.net/?retryWrites=true&w=majority");
    }
    
    async initialize() {
        await this.dbClient.connect();
        this.E14DbPort = this.dbClient.db();

        var collections = [];
        (await this.E14DbPort.listCollections().toArray()).forEach(v => collections.push(v.name));

        this.usersLoad = await this.fastCreateCollection(collections, "usersLoad");
        this.stationsLoad = await this.fastCreateCollection(collections, "fireStationsLoad");
        this.eventsLoad = await this.fastCreateCollection(collections, "eventsLoad");
    }

    private async fastCreateCollection(collections: Array<string>, name: string) {
        return collections.includes(name) ?
            this.E14DbPort.collection(name) :
            await this.E14DbPort.createCollection(name);
    }
}