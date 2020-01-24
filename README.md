# cube-bot

### MacOS :

- [Install Brew](https://brew.sh)

- Install Yarn : `brew install yarn`

- Install mongoDB : `brew tap mongodb/brew && brew install mongodb-community`

- Start mongoDB : `brew services start mongodb-community`

### Windows :

- [Install Node](https://nodejs.org/en/)

- [Install Yarn](https://yarnpkg.com/lang/en/docs/install/#windows-stable)

- [Install MongoDB](https://www.mongodb.com/download-center/community?jmp=nav)



### MacOS and Windows :

- Clone repository : `git clone https://github.com/Nogesma/cube-bot` 

- Install modules : `yarn install`

 - Create a file named `.env` in the root directory. You will need to have the bot token, the database url, the channels ID, the server ID, and the ID of the 'Champion' role'.
 
#### Example :

```dotenv
TOKEN=xyz
333=1234
222=1234
OH=1234
3BLD=1234
SQ1=1234
MINX=1234
CHANNEL_SPAM=1234
ROLE_ID=1234
GUILD_ID=1234
MONGO_URL=mongodb://localhost:27017/test
```


- Init : `node init.js`
- Start the bot: `gulp`

## Contribute

- Create a new branch (feature/, fix/, update/, refactor/)(name)
- Push your changes to the branch
- Create a pull request

It is recommended to use the prettier extension
