/*
   this program was inspired by the following program written by Pr Liechti and available
   on dockerhub (oliechti/thermometer).   
   this program simulates a musician that produces the sound related to it's instrument
   and communicates it to a multicast group. Other programs can join the group and 
   "listen" to the sounds. The "sounds" are transmitted in json payloads with the following
   format:
   {"uuid" : "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60","sound" : "pouet"}
   
   Usage: to start a musician, type the following command in a terminal
		(of course, you can run several musicians in parralel and observe that all sounds
		are communicated through the multicast group);
		
	node musician.js musician/instrument 
	where instrument is the instrument played by the musician (for example piano).
*/

var protocol = require('./musicianProtocol');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
var s = dgram.createSocket('udp4');

/*
 * Let's genereate a unique identifier for the musician (uuid) 
 */
var uuid = require('uuid/v1');

/*
 * Let's get the musician's instrument from the command line attributes
 * Some error handling wouln't hurt here...
 */
var instrument = process.argv[2];



/*
 * Let's define a javascript class for our musician. The constructor accepts
 * a unique ID (uuid), and the sound emmited by the musician's instrument
 * at every iteration
 */
function Musician(uuid, instrument) {
	this.uuid = uuid;
	this.sound = protocol.instruments[instrument];

	Musician.prototype.update = function() {
/*
	  * Let's create the "signal" as a dynamic javascript object, 
	  * add the 2 properties (uuid and sound)
	  * and serialize the object to a JSON string
	  */
		var signal = {
			uuid : this.uuid,
			sound: this.sound,
		};
		var payload = JSON.stringify(signal);

/*
	   * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
	   * the multicast address. All subscribers to this address will receive the message.
	   */
		message = new Buffer(payload);
		s.send(message, 0, message.length, protocol.MULTICAST_PORT, protocol.MULTICAST_ADDRESS, function(err, bytes) {
			console.log("Sending payload: " + payload + " via port " + s.address().port);
		});

	
	}
/*
	 * Let's take and send a measure every 1000 ms
	 */
	setInterval(this.update.bind(this), 1000);
}


/*
 * Let's create a new musician - the regular publication of measures will
 * be initiated within the constructor
 */
var musician = new Musician(uuid(), instrument);
