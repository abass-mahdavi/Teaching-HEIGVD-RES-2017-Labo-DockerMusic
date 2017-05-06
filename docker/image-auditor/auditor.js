/*
 This app, Auditor, simulates someone who listens to the orchestra. This application 
 has two responsibilities. Firstly, it must listen to Musicians and keep track of 
 active musicians. A musician is active if it has played a sound during the last 5 
 seconds. Secondly, it must make this information available to you. Concretely, this 
 means that it should implement a very simple TCP-based protocol.
 
 This app is inspired from Professor Liechti "station" app check here:
 https://github.com/SoftEng-HEIGVD/Teaching-Docker-UDP-sensors
 

 The sounds played by musicians are transported in json payloads with the following format:

   {"uuid":"ce62bd80-3266-11e7-ad47-ff6021a04453","sound":"ti-ta-ti"} 

 Usage: to start the station, use the following command in a terminal

   node auditor.js

*/

/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * thermometer.js and station.js. The address and the port are part of our simple 
 * application-level protocol
 */
var protocol = require('./auditorProtocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * We use a Map to keep a record of all musicians the key being the musician uuid
 */
 var allMusicians = new Map();

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by musicianss and containing sounds
 */
var auditorSocket = dgram.createSocket('udp4');
auditorSocket.bind(protocol.MULTICAST_PORT, function() {
  console.log("Joining multicast group");
  auditorSocket.addMembership(protocol.MULTICAST_ADDRESS);
});

/* 
 * This call back is invoked when a new datagram has arrived.
 */
auditorSocket.on('message', function(msg, source) {
	//console.log("Data has arrived: " + msg + ". Source port: " + source.port);
	msg = JSON.parse(msg); // we need to parse the received message to an object
	//and we assusme the message received is from a unique music instrument, hence a unique identifier uuid
	var musician = 
	{
		'uuid' : msg.uuid,
		'instrument': protocol.sounds[msg.sound],
		'activeSince' : Date.now() //The Date.now() method returns the number of milliseconds elapsed since 
									// January 1st 1970 00:00:00 UTC.
	}
	
	allMusicians.set(musician.uuid, musician);
	
	console.log("Data has arrived: " + musician.uuid + " " + musician.instrument + " " + musician.activeSince);	
});


/* 
 * now we need a tcp server to communicate the list of activ musicians
 * that means those that have emitted at least one signal during the 
 * last 5 seconds (5000 ms)
 * server code based on https://gist.github.com/tedmiston/5935757
 *
 */
var net = require('net');

var server = net.createServer(function(socket) {
	var alive = [];
	var now = Date.now();
	for (var [uuid, musician] of allMusicians)
	{
		if (now - musician.activeSince < 5000){
			alive.push(musician);
		}
	}		
	
	socket.write(JSON.stringify(alive));
	
	socket.end();

});

server.listen(protocol.TCP_PORT, protocol.TCP_IP_ADDRESS);