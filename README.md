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

 - Create a file named `.env` in the root directory. You will need to have the bot token, the database url, the channels ID, the server ID, and the ID of the 'Champion' role'.
 
#### Example :

```dotenv
TOKEN=xyz
CHANNEL_333=1234
CHANNEL_222=1234
CHANNEL_OH=1234
CHANNEL_3BLD=1234
CHANNEL_SQ1=1234
ROLE_ID=1234
GUILD_ID=1234
MONGO_URL=mongodb://localhost:27017/test
```


- Start the database : `mongod`
- Init : `node init.js 17 18 19 20 21`
- Start the bot : `grunt`

## Contribute

- Create a new branch (feature/, fix/, update/, refactor/)(name)
- Push your changes to the branch
- Create a pull request

It is recommended to use the prettier extension
