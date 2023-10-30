# Routes Documentation
## 1. Functionality
- This is the API routes for the server.

## 2. Response format
- Each route on their own will follows the same format to indicate the result of that route, either `true` or `false`.
- After that, you can put any kind of data related to that route.

Example:
```json
{
    "result": true,
    "token": "ABC"
}
```

## 3. Route URI rules
### Context
- Link every related routes to a code file.
- Highly customizable.
- Easier to maintain, easier to understand.

### The url path MUST be the same as the code filename.
Example: `userRegister.ts`
```ts
router.post("/userRegister/request", ...);
```

### MUST be inside a class and routes must be created in `constructor`.
Example: `userRegister.ts`

Class name: `userRegister` -> `UserRegister` | Capitalize the first letter of the code filename.
```ts
export class UserRegister {
    router = express.Router();

    constructor () {
        this.router.use(express.json());
        this.router.post("/register/userRegister/request", ...);
    }
}
```