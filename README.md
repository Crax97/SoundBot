# SoundBot
A SoundBot for Discord made in Node.js and Discord.io

# Dependencies
discord.io<br/>
node-opus<br/>
mongodb<br/>
express(will be soon removed)<br/>

# Usage
Create a file named "credentials.js" in the bot's folder, then add two lines:
```javascript
exports.botToken = "YOUR_TOKEN_HERE";
exports.botToken = "YOUR_BOT_ADD_LINK";
```

Then do 
```bash
node app.js
```

Remember that each user has its own sounds

# Commands
!add [url] [soundname]<br/>
Adds a new sound, the url must be a direct link to an mp3, wav or ogg file or it must be a valid youtube link
  
!play [soundname]<br/>
Plays a sound
  
!delete [soundname]<br/>
Deletes a sound, the physical file will not removed because another user could reference the sound file
  
!list<br/>
List all your sounds
  
!help<br/>
Displays an help message
