var actions = [];
var fs = require('fs');
var http = require('https');
var mongo = require('mongodb');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var regex = require('./regex.js');

var client = mongo.MongoClient;
var ObjectId = mongo.ObjectID;

var paths = [];
var database;

var soundstream;

client.connect("mongodb://localhost/bot", function (err, db) {
	if (err) {
	
		console.log("Cannot connect to DB!");
		process.exit();

	}
	database = db;

	console.log("Connected to database");

});

actions.push(
	{
		name: '!add',
		func: function (user, userID, channelID, voiceChannelId, message, rawEvent, bot, messages) {
			if (messages.length == 3) {
				var realname = messages[2];
				var path = messages[1];
				var _fn = messages[1].split('/')
				var filename = _fn[_fn.length - 1];
			
					
					if(path.indexOf("https://www.youtube.com/watch?v=") != -1)
					{
						console.log ("filename is a youtube video");
						bot.sendMessage(
							{
							to: channelID,
							message:"Downloading the youtube video, i'll tell you when i'm done."
							});
						
							exec('youtube-dl ' + path + ' --extract-audio --audio-format mp3' ,function(error, stdout, stderr)
							{
							
								var ytname;
								
								//YEAH I KNOW THIS DOESN'T WORK, WILL BE FIXED
									
								if(error)
									console.log('stdout: ${error}');
								if(stdout)
								{
									console.log('stdout: ${stdout}');
									var strings = stdout.toString().split('\n');
									for(var s in strings)
									{
										if(strings[s].indexOf('[ffmpeg] Destination: ') != -1)
										{
											ytname = strings[s].replace('[ffmpeg] Destination: ', '');
										}
									}
								}
								if(stderr)
									console.log('stdout: ${stderr}');
								if(ytname)
								{
								database.collection('users').updateOne(
									{
								
										userId: userID,
										'sounds.playname': { 
															$ne: realname
															}
										},
										{
											$addToSet:
											{
												
												sounds:
												{
													playname: realname,
			
													url: path,
													filename: ytname
														
												}
											}
									
										},
										{
											upsert: true
										});
							bot.sendMessage(
								{
								to: channelID,
								message:"Video downloaded and ready to play."
								});								
									
								} else {
									
									bot.sendMessage(
										
										{
											to: channelID,
											message: " Could not download the video, sorry! Check the link and try again"
										});
									
								}
							});
						
					} else if (regex.audio.exec(filename)[0]) {
					
					//https://www.myinstants.com/media/sounds/hadouken.mp3
					var file = fs.createWriteStream(filename);
					var request = http.get(path, function (res) {
						res.pipe(file);
						bot.sendMessage(
							{
								to: channelID,
								message: "File downloaded! " + realname
							}
						);
						
						
						
						database.collection('users').updateOne(
							{
								
								userId: userID,
									'sounds.playname': { 
											$ne: realname
									}
							},
							{
								$addToSet:
								{
									
									sounds:
									{
										playname: realname,

										url: path,
										filename: filename
											
									}
								}
						
							},
							{
								upsert: true
							});

					});
				}
				else {
					bot.sendMessage(
						{
							to: channelID,
							message: "The url must end with a file extension, like mp3 or wav!"
						});
				}
			} else {
				bot.sendMessage(
					{
						to: channelID,
						message: "you used the command in the wrong way! Correct usage is: url filename"
					}
				);
			}
		}
	});
actions.push(
	{
		name: "!play",
		func: function (user, userID, channelID, voiceChannelId, message, rawEvent, bot, messages) {
			var sound = messages[1];
			database.collection('users').find(
				{
					userId: userID
				}).toArray(function (err, docs) {
				var found = false;
				if ((docs.length) && (docs[0].sounds.length)) {
					console.log(docs[0].sounds);
					docs[0].sounds.forEach(function (value) {
						if (value.playname == sound) {
							found = true;
							bot.sendMessage(
								{
									to: channelID,
									message: "Joining your channel"
								}
							);
							console.log("Playing sound");
							bot.joinVoiceChannel(voiceChannelId, function () {
								bot.getAudioContext({ channel: voiceChannelId, stereo: true }, function (stream) {
									stream.playAudioFile(value.filename);
									bot.sendMessage(
										{
											to: channelID,
											message: "Finished"
										}
									);
									
									soundstream = stream;
									soundstream.once('fileEnd', function () {
										soundstream = undefined;
										bot.leaveVoiceChannel(voiceChannelId);
									})
								})
							})
						}
								
					});
				}
				else {
					bot.sendMessage(
						{
							to: channelID,
							message: "You have not registered any sounds yet! Use /add!\n"
							+"Remeber that each user has its own soundboard"
						});
				}
				if (!found) {
					bot.sendMessage(
						{
							to: channelID,
							message: "Could not find sound " + sound
						});

				}
			});

		}
	});

actions.push(
	{
		name: "!list",
		func: function (user, userID, channelID, voiceChannelId, message, rawEvent, bot, messages) {
		
			database.collection('users').find
			(
				{
					userId: userID
				}
			).toArray(function (err, docs) {
				
				var message = "Listing all sounds for "+ user +": \n";
				if ((docs[0]) && (docs[0].sounds.length)) {
				
					docs[0].sounds.forEach(function (value) {
						message += "\t\tFilename: " + value.filename + " Playname: " + value.playname + "\n";
					});
				}					
				bot.sendMessage(
						{
							to: channelID,
							message: message
						}
					);
			}
			);

		}
	});

actions.push(
    {
        name: "!help",
        func: function (user, userID, channelID, voiceChannelId, message, rawEvent, bot, messages) {
        
            var help = "SoundBot\n"
             +"Type:\n"+
             "!add fileUrl fileName to add a new sound\n"+
             "!play fileName to play a sound (You must be connected to a server and in a voice channel)\n"+
             "!list to list all your sounds\n"+
             "Developed by @Crax#6710 ";
             
        
            bot.sendMessage(
                {
                to: channelID,
                message: help
                });
            
        }
    });

actions.push(
	{
		name: "!delete",
		func: function (user, userID, channelID, voiceChannelId, message, rawEvent, bot, messages) {
			var name = messages[1];
			if(name)
			{
				database.collection('users').update(
					{
						userId: userID
					},
					{
						
						$pull:
						{
							sounds:
							{
								playname: name
							}
								
						}
						
					}
					
					, function(err, docs, status) 
					{
						if(docs.result.nModified > 0)
						{
							bot.sendMessage(
								{
								to: channelID,
								message:name + " deleted."
									
								});
						}
						
						else
						
						{
							
							bot.sendMessage(
								{
								to: channelID,
								message:name + " not found."
								});							
						}
					}
				);
			}
			else
			{
				bot.sendMessage(
					{
					to:channelID,
					message: "Which sound should i delete? use !list to list all your sounds"
					});
						
				}
        } 
	});

actions.push(
	{
		name: "!stop",
		func: function(user, userID, channelID, voiceChannelId, message, rawEvent, bot)
		{
			if(soundstream)
			{
				soundstream.stopAudioFile();
			}
		}
	})

exports.check = function(user, userID, channelID, voiceChannelId, message, rawEvent, bot)
{
    var messages = message.split(" ");
    actions.forEach(function(e)
    {
        if(e.name === messages[0])
        {
            e.func(user, userID, channelID, voiceChannelId, message, rawEvent, bot, messages)
        }
    });
}