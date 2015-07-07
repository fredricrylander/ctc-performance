// Signal that the shared worker is starting up.
console.info('Shared-worker-impl.js: starting up.');

// Connected clients.
var clients = {};

// Test log, the contents depends on the current test.
var testLog = {};

// Simple name generator for connected clients.
var currentName = 0;
function getNextName() {
	return '' + currentName++;
}

// Handle client connect events.
self.onconnect = function (event) {
	var name = getNextName();
	event.ports[0]._data = { port: event.ports[0], name: name };
	clients[name] = event.ports[0]._data;
	event.ports[0].onmessage = onMessage;
};

// Handle incoming messages.
function onMessage(event) {
	switch (event.data.message) {
		case 'do-meta-ping':
			// Perform the actual test.
			runPerformanceTest(event);
			break;
			
		case 'meta-pong':
			// Test pong, a client has answered.
			testLog.counter += 1;
			if (testLog.counter === testLog.counterTarget) {
				clients[testLog.resultTargetName].port.postMessage({
					message: 'meta-ping-result',
					millisecs: Date.now() - testLog.beginTime
				});
			}
			break;
			
		case 'bye':
			// A client is signing off.
			clients[event.target._data.name].port.close();
			delete clients[event.target._data.name];
			break;
		
		default:
			// Echo any other messages to all connected clients.
			var name = event.target._data.name;
			for (var client in clients) {
				if (client !== name) {
					clients[client].port.postMessage(event.data);
				}
			}
	}
}

/**
 * Runs the actual performance test.
 * 
 * @param event {object} The event object for the incoming message.
 */
function runPerformanceTest(event) {
	var testTimes = event.data.times || 1;
	testLog = {
		beginTime: Date.now(),
		counter: 0,
		counterTarget: testTimes * Object.keys(clients).length,
		resultTargetName: event.target._data.name
	};
	var payload = testLog.payload = JSON.parse(JSON.stringify(event.data.payload));
	for (var ith = 0; ith < testTimes; ++ith) {
		for (var jth in clients) {
			clients[jth].port.postMessage({
				message: 'meta-ping',
				payload: payload
			});
		}
	}
}