var cluster = require('cluster');

function findVoiceChannel(userID, servers, callback, errCallback) {
	
	for (var i in servers) {
		var members = servers[i].members;
		for (var j in members) {
			if (j == userID) {
				if (members[j].voice_channel_id !== 'undefined') {
					callback(members[j].voice_channel_id);
				}
				
			}
		}
	}
}

	

if(cluster.isMaster)
{
	cluster.fork();	

	cluster.on('exit', function(worker)
	{
		cluster.fork();	
	});
} else {
	var express = require('express');
	var app = express();
	
	var Discord = require('discord.io');
	var actions = require('./actions.js');

    var credentials = require('./credentials.js');

	var bot = new Discord.Client(
	{
	    token: credentials.botToken
	});
    
	app.get('/', function(req, res)
	{
		res.redirect(303, credentials.botAddLink);
	})
		
	app.listen(process.env.PORT, process.env.IP);


	bot.connect();
	bot.on('ready', function()
	{
	    bot.setPresence(
	      {
	        game: "/help"
	      });
	    console.log("Bot ready!");
	});
	
	bot.on('message', function(user, userID, channelID, message, rawEvent) {
		var serv = bot.servers;
		findVoiceChannel(userID, serv, function (voiceChannelId) {
			actions.check(user, userID, channelID, voiceChannelId, message, rawEvent, bot);
		});
	});
}
  
