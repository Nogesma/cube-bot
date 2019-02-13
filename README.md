# cube-bot

### MacOS :

- [Install Brew](https://brew.sh)

- Install Yarn : `brew install yarn`

- Install mongoDB : `brew install mongodb`

- You will need to create the db directory and change its permission :

  - `sudo mkdir -p /data/db`
  
  - ``sudo chown -R `id -u` /data/db``

### Windows :

- [Install Node](https://nodejs.org/en/)

- [Install Yarn](https://yarnpkg.com/lang/en/docs/install/#windows-stable)

- [Install MongoDB](https://www.mongodb.com/download-center/community?jmp=nav)



### MacOS and Windows :

- Clone repository : `git clone https://github.com/Waxo/cube-bot` 

- Install modules : `yarn install`

 - Create a file named `.env` in the root directory. You will need to have the bot token, the database url, and the channels ID.
 
#### Example :

```dotenv
TOKEN=xyz
CHANNEL_333=1234
CHANNEL_222=1234
MONGO_URL=mongodb://localhost:27017/test
```


- Start the database : `mongod`
- Init : `node init.js 333 222 444 3BLD MEGA OH SQ1`
- Start the bot : `grunt`
