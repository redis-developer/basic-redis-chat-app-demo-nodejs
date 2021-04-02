# Basic Redis Chat App Demo

Showcases how to impliment chat app in Node.js, Socket.IO and Redis. This example uses **pub/sub** feature combined with web-sockets for implementing the message communication between client and server.

<a href="https://raw.githubusercontent.com/redis-developer/basic-redis-chat-app-demo-dotnet/main/docs/screenshot000.png?raw=true"><img src="https://raw.githubusercontent.com/redis-developer/basic-redis-chat-app-demo-dotnet/main/docs/screenshot000.png?raw=true" width="49%"></a>
<a href="https://raw.githubusercontent.com/redis-developer/basic-redis-chat-app-demo-dotnet/main/docs/screenshot001.png?raw=true"><img src="https://raw.githubusercontent.com/redis-developer/basic-redis-chat-app-demo-dotnet/main/docs/screenshot001.png?raw=true" width="49%"></a>


## Try it out

#### Deploy to Heroku

<p>
    <a href="https://heroku.com/deploy" target="_blank">
        <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy to Heorku" />
    </a>
</p>

#### Deploy to Google Cloud

<p>
    <a href="https://deploy.cloud.run" target="_blank">
        <img src="https://deploy.cloud.run/button.svg" alt="Run on Google Cloud" width="150px"/>
    </a>
</p>

### Initialization
For simplicity, a key with **total_users** value is checked: if it does not exist, we fill the Redis database with initial data.
```EXISTS total_users``` (checks if the key exists)

The demo data initialization is handled in multiple steps:

**Creating of demo users:**
We create a new user id: `INCR total_users`. Then we set a user ID lookup key by user name: ***e.g.*** `SET username:nick user:1`. And finally, the rest of the data is written to the hash set: ***e.g.*** `HSET user:1 username "nick" password "bcrypt_hashed_password"`.

Additionally, each user is added to the default "General" room. For handling rooms for each user, we have a set that holds the room ids. Here's an example command of how to add the room: ***e.g.*** `SADD user:1:rooms "0"`.

**Populate private messages between users.**
At first, private rooms are created: if a private room needs to be established, for each user a room id: `room:1:2` is generated, where numbers correspond to the user ids in ascending order. 

***E.g.*** Create a private room between 2 users: `SADD user:1:rooms 1:2` and `SADD user:2:rooms 1:2`.

Then we add messages to this room by writing to a sorted set: 
***E.g.*** `ZADD room:1:2 1615480369 "{'from': 1, 'date': 1615480369, 'message': 'Hello', 'roomId': '1:2'}"`. 

We use a stringified *JSON* for keeping the message structure and simplify the implementation details for this demo-app.

**Populate the "General" room with messages.** Messages are added to the sorted set with id of the "General" room: `room:0`

### Pub/sub
After initialization, a pub/sub subscription is created: `SUBSCRIBE MESSAGES`. At the same time, each server instance will run a listener on a message on this channel to receive real-time updates. 

Again, for simplicity, each message is serialized to ***JSON***, which we parse and then handle in the same manner, as WebSocket messages.

Pub/sub allows connecting multiple servers written in different platforms without taking into consideration the implementation detail of each server.

### Real-time chat and session handling

When a WebSocket/real-time server is instantiated, which listens for the next events:

**Connection**. A new user is connected. At this point, a user ID is captured and saved to the session (which is cached in Redis). Note, that session caching is language/library-specific and it's used here purely for persistence and maintaining the state between server reloads. 

A global set with `online_users` key is used for keeping the online state for each user. So on a new connection, a user ID is written to that set: 

**E.g.** `SADD online_users 1` (We add user with id 1 to the set **online_users**).

After that, a message is broadcasted to the clients to notify them that a new user is joined the chat.

**Disconnect**. It works similarly to the connection event, except we need to remove the user for **online_users** set and notify the clients: `SREM online_users 1` (makes user with id 1 offline).

**Message**. A user sends a message, and it needs to be broadcasted to the other clients. The pub/sub allows us also to broadcast this message to all server instances which are connected to this Redis:

`PUBLISH message "{'serverId': 4132, 'type':'message', 'data': {'from': 1, 'date': 1615480369, 'message': 'Hello', 'roomId': '1:2'}}"`

Note we send additional data related to the type of the message and the server id. Server id is used to discard the messages by the server instance which sends them since it is connected to the same `MESSAGES` channel. 

`type` field of the serialized JSON corresponds to the real-time method we use for real-time communication (connect/disconnect/message). 

`data` is method-specific information. In the example above it's related to the new message.

### How the data is stored:

Redis is used mainly as a database to keep the user/messages data and for sending messages between connected servers.

The real-time functionality is handled by **Socket.IO** for server->client messaging. Additionally each server instance subscribes to the `MESSAGES` channel of pub/sub and dispatches messages once they arrive.

- The chat data is stored in various keys and various data types.
  - User data is stored in a hash set where each user entry contains the next values:
    - `username`: unique user name;
    - `password`: hashed password
  - Additionally a set of rooms is associated with user
  - **Rooms** are sorted sets which contains messages where score is the timestamp for each message
    - Each room has a name associated with it
  - **Online** set is global for all users is used for keeping track on which user is online.

* User hash set is accessed by key `user:{userId}`. The data for it stored with `HSET key field data`. User id is calculated by incrementing the `total_users`.
    * E.g `INCR total_users`

* Username is stored as a separate key (`username:{username}`) which returns the userId for quicker access.
    * E.g `SET username:Alex 4`

* Rooms which user belongs too are stored at `user:{userId}:rooms` as a set of room ids. 
    * E.g `SADD user:Alex:rooms 1`

* Messages are stored at `room:{roomId}` key in a sorted set (as mentioned above). They are added with `ZADD room:{roomId} {timestamp} {message}` command. Message is serialized to an app-specific JSON string.
    * E.g `ZADD room:0 1617197047 { "From": "2", "Date": 1617197047, "Message": "Hello", "RoomId": "1:2" }`

### How the data is accessed:

**Get User** `HGETALL user:{id}`. Example: `HGETALL user:2`, where we get data for the user with id: 2.

**Online users:** `SMEMBERS online_users`. This will return ids of users which are online

**Get room ids of a user:** `SMEMBERS user:{id}:rooms`. Example: `SMEMBERS user:2:rooms`. This will return IDs of rooms for user with ID: 2

**Get list of messages** `ZREVRANGE room:{roomId} {offset_start} {offset_end}`. 
Example: `ZREVRANGE room:1:2 0 50` will return 50 messages with 0 offsets for the private room between users with IDs 1 and 2.


## How it works?

### Sign in
![How it works](docs/screenshot000.png)

### Chats
![How it works](docs/screenshot001.png)

The chat server works as a basic *REST* API which involves keeping the session and handling the user state in the chat rooms (besides the WebSocket/real-time part).

When the server starts, the initialization step occurs. At first, a new Redis connection is established and it's checked whether it's needed to load the demo data. 

## How to run it locally?

#### Copy `.env.sample` to create `.env`. And provide the values for environment variables

    - REDIS_ENDPOINT_URI: Redis server URI
    - REDIS_PASSWORD: Password to the server

#### Run frontend

```sh
cd client
yarn install
yarn start
```

#### Run backend

```sh
yarn install
yarn start
```
