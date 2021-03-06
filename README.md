# cube-bot
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

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

- Install packages : `yarn`

- Create a file named `.env` in the root directory. You will need to have the bot token, the database url, the channels ID, the server ID, and the ID of the 'Champion' role.
 
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


- Init : `yarn run init`
- Start the bot in development mode : `yarn run dev`

## Contribute

- Create a new branch (feature/, fix/, update/, refactor/)(name)
- Push your changes to the branch
- Create a pull request
