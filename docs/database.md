# Databse Documentation
## 1. Functionality
- This is the database input for the server, using MongoDB.
- Provide storage for server to store fire stations locations and user's location for fast query.

## 2. Format
### MUST have a file named `controller.ts`
### Except for `initialize` function every other functions must be private.
Example: `controller.ts`
```ts
export class E14DataBase {
    dbClient: mongodb.MongoClient;
    ...

    constructor() {
        this.dbClient = new mongodb.MongoClient("");
    }
    
    async initialize() {
        // Initialize the database, setup every variable, ready to be used.
    }

    private async otherFunctions() {
        // Function to support the initialize process here.
    }
}
```
Any other functions that requires more lines should be in another file.