# Basic Redis Chat App Demo

A basic chat application built with Express.js Socket.io and Redis.

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

## How it works?

![How it works](docs/screenshot001.png)

### How the data is stored:

Redis is used mainly as a database to keep the user/messages data and for sending messages between connected servers.  
The session is stored separately in Redis with a use of `connect-redis` **library** on successful log in.

The real-time functionality is handled by **Socket.IO** for server-client messaging. Additionally each server instance subscribes to the `MESSAGES` channel of pub/sub and dispatches messages once they arrive.

- The chat data is stored in various keys and various data types.
  - User data is stored in a hash set where each user entry contains the next values:
    - `username`: unique user name;
    - `password`: hashed password
  - Additionally a set of rooms is associated with user
  - **Rooms** are sorted sets which contains messages where score is the timestamp for each message
    - Each room has a name associated with it
  - **Online** set is global for all users is used for keeping track on which user is online.

**User** hash set is accessed by key `user:{userId}`. The data for it stored with `HSET key field data`. User id is calculated by incrementing the `total_users` key (`INCR total_users`)

**Username** is stored as a separate key (`username:{username}`) which returns the userId for quicker access and stored with `SET username:{username} {userId}`.

**Rooms** which user belongs too are stored at `user:{userId}:rooms` as a set of room ids. A room is added by `SADD user:{userId}:rooms {roomId}` command.

**Messages** are stored at `room:{roomId}` key in a sorted set (as mentioned above). They are added with `ZADD room:{roomId} {timestamp} {message}` command. Message is serialized to an app-specific JSON string.

### How the data is accessed:

- Get User `HGETALL user:{id}`
- Online users: `SMEMBERS online_users`. This will return ids of users which are online
- Get room ids of a user: `SMEMBERS user:{id}:rooms`
- Get list of messages `ZREVRANGE room:{roomId} {offset_start} {offset_end}`

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
