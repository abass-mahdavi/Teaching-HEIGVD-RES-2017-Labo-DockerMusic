/*
 This app, Auditor, simulates someone who listens to the orchestra. This application 
 has two responsibilities. Firstly, it must listen to Musicians and keep track of 
 active musicians. A musician is active if it has played a sound during the last 5 
 seconds. Secondly, it must make this information available to you. Concretely, this 
 means that it should implement a very simple TCP-based protocol.
 
 This app is inspired from Professor Liechti "station" app check here:
 https://github.com/SoftEng-HEIGVD/Teaching-Docker-UDP-sensors
 

 The sounds played by musicians are transported in json payloads with the following format:

   {
  	"uuid" : "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60",
  	"instrument" : "piano",
  	"activeSince" : "2016-04-27T05:20:50.731Z"
   }

 Usage: to start the station, use the following command in a terminal

   node station.js

*/

/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * thermometer.js and station.js. The address and the port are part of our simple 
 * application-level protocol
 */
var protocol = require('./musicians-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by musicianss and containing sounds
 */
var auditorSocket = dgram.createSocket('udp4');
auditorSocket.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  auditorSocket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

/* 
 * This call back is invoked when a new datagram has arrived.
 */
auditorSocket.on('message', function(msg, source) {
	console.log("Data has arrived: " + msg + ". Source port: " + source.port);
	msg = JSON.parse(msg); // we need to parse the received message to an object
	//and we assusme the message received is from a unique music instrument, hence a unique identifier uuid
	var musicInstrument = 
	{
		'uuid' : msg.uuid,
		'sound': msg.sound,
		'activeSince' : msg.date,
	}

	
});

