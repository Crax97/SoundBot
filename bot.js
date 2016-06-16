var cluster = require('cluster');
var main = require('./main.js');

if(cluster.isMaster)
{
	cluster.fork();	

	cluster.on('exit', function(worker)
	{
		cluster.fork();	
	});
} else {
	main.run();
}
  
