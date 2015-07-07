(function () {
	'use strict';
	
	//-------------------------------------------------------------------------
	// Globals
	//-------------------------------------------------------------------------
	
	// The current window’s ID.
	var windowId = Date.now() + Math.random();
	
	// Test log, the contents depends on the currently running test.
	var testLog = {};
	
	
	//-------------------------------------------------------------------------
	// Local Storage Setup
	//-------------------------------------------------------------------------
	
	if (!window.localStorage) {
		var msg = 'This browser does not support the local storage API.';
		log(msg); alert(msg); throw new Error(msg);
	}
	
	var broadcastKey = 'bk-' + windowId;
	
	function postMessageImpl(message) {
		localStorage.setItem(broadcastKey, JSON.stringify(message));
		localStorage.removeItem(broadcastKey);
	}
	
	window.addEventListener('storage', function (event) {
		if (!event.newValue) return;
		var message = JSON.parse(event.newValue);
		if (message) onMessage(message);
	});
	
	
	//-------------------------------------------------------------------------
	// Test Routines
	//-------------------------------------------------------------------------

	/**
	 * Incoming message handler.
	 * 
	 * @param data {object} The incoming data object. 
	 */
	function onMessage(data) {
		switch (data.message) {
			case 'close':
				if (data.senderId !== windowId) {
					window.close();
				}
				break;
				
			case 'ping':
				postMessage('pong', { payload: data.payload });
				break;
				
			case 'pong':
				testLog.counter += 1;
				if (testLog.counter === testLog.counterTarget) {
					testLog.millisecs = Date.now() - testLog.timeBegin;
					log('Ping-pong with ' + testLog.payload.size + ' bytes to ' + testLog.windowCount + ' windows ' + 
						testLog.times + ' times took ' + testLog.millisecs + ' milliseconds.');
					onTestFinished(testLog.millisecs);
				}
				break;
		}
	}
	
	/**
	 * Post a message on the communications channel.
	 * 
	 * @param message {string} The message to send.
	 * @param meta {object} Extra parameters to send (optional.)
	 */
	function postMessage(message, meta) {
		var messageObject = {
			senderId: windowId,
			message: message
		};

		for (var key in meta) {
			messageObject[key] = meta[key];
		}

		postMessageImpl(messageObject);
	}
	
	/**
	 * Log a message to screen and console.
	 * 
	 * @param msg {string} The message to log.
	 */
	function log(msg) {
		console.info('LOG:', msg);
		document.getElementById('log').innerHTML = msg;
	}
	
	/**
	 * Log to the non-volatile log area.
	 * 
	 * @param msg {string} The message to log.
	 */
	function longLog(msg) {
		var elm = document.getElementById('longLog');
		elm.innerHTML += msg + '<br>';
		elm.scrollTop = elm.scrollHeight;
	}
	
	/**
	 * Constructs a payload of the given size.
	 * 
	 * @param size {number} Size of the payload in bytes.
	 * @return {object} The payload, including its size.
	 */
	function constructPayload(size) {
		return {
			data: Array(size + 1).join('x'),
			size: size
		};
	}
	
	/**
	 * Counts the open windows/tabs that are connected on the same 
	 * communications channel.
	 * 
	 * @param callback {function} The callback to call when done.
	 */
	function countWindows(callback) {
		callback = callback || function () {};
		testLog = {
			counter: 0,
			counterTarget: -1 // No target to reach.
		};
		log('Counting windows...');
		postMessage('ping');
		setTimeout(function onTimeout() {
			var windowCount = testLog.counter + 1;
			log('There are ' + windowCount + ' connected windows.');
			callback(windowCount);
		}, 300);
	};
	
	/**
	 * Handler for when a test has finished.
	 * 
	 * @param millisecs {number} The test time in millisecs.
	 */
	function onTestFinished(millisecs) {
		testLog.results.push(millisecs);
		
		// Redo the test a couple of times.
		testLog.repeat -= 1;
		if (testLog.repeat > 0) {
			setTimeout(function () { 
				runPerformanceTestImpl(); 
			}, 0);
			return;
		}

		// Calculate the average time.
		var average = Math.round(testLog.results.reduce(function (prev, curr, ith) { 
			return prev + (curr - prev) / (ith + 1); 
		}));
		var logMsg = 'Ping-pong with ' + testLog.payload.size + ' bytes to ' + testLog.windowCount + ' window' + 
			(testLog.windowCount > 1 ? 's' : '') + ' ' + testLog.times + ' times took ' + average +	' milliseconds' +
			(testLog.results.length > 1 ? ' in average of ' + testLog.results.length + ' tests (' + testLog.results.join(', ') + ').' : '.');
		log(logMsg);
		longLog(logMsg);
		log('Test done.');
		
		// Redo the whole test for several windows.
		if (document.getElementById('autoWindow').checked) {
			var windowCountMax = parseInt(document.getElementById('testWindowCountMax').value, 10) || testLog.windowCount;
			if (testLog.windowCount < windowCountMax) {
				openSlaveWindowOrHalt();
				setTimeout(function () {
					runPerformanceTest();
				}, 200);
			}
			else {
				closeOtherWindows();
				log('All tests done.');
			}
		}
	}
	
	/**
	 * Opens the given amount of windows and returns their window references.
	 * 
	 * @param count {number} The number of windows to open.
	 * @return {array} Array of window references to the newly opened windows.
	 */
	function openWindows(count) {
		count = Math.max(count || parseInt(document.getElementById('numWindows').value, 10) || 1, 1);
		var windowRefs = [];
		while (count--) {
			windowRefs.push(window.open(window.location.href, '' + (Date.now() + Math.random())));
		}
		window.focus();
		return windowRefs;
	};
	
	/**
	 * Opens a new window, or throws an exception.
	 */
	function openSlaveWindowOrHalt() {
		var windowRef = openWindows(1).pop();
		if (!windowRef) {
			var msg = 'Could not open a new window. Allow the script to open new windows and restart the test.';
			log(msg);
			alert(msg);
			throw new Error('Could not open a new window.');
		}
		windowRef.onload = function () {
			windowRef.setIsSlave();
		};
	}
	
	/**
	 * Close all the connected windows (except the current one.)
	 * 
	 * @param callback {function} The callback to call when done (optional.)
	 */
	function closeOtherWindows(callback) {
		callback = callback || function () {};
		postMessage('close');
		setTimeout(function () {
			callback();
		}, 100);
	}
	
	/**
	 * Initiates and runs the performance test.
	 */
	function runPerformanceTest() {
		var testCount = Math.max(parseInt(document.getElementById('testCount').value, 10), 1);
		var testSize = Math.max(parseInt(document.getElementById('testSize').value, 10), 1);
		var testRepeat = Math.max(parseInt(document.getElementById('testRepeat').value, 10), 1);
		
		countWindows(function (windowCount) {
			if (windowCount < 2) {
				log('NOTE: please open more windows before running tests.');
				return;
			}
			
			var payload = constructPayload(testSize);
			testLog = {
				counter: 0,
				counterTarget: (windowCount - 1) * testCount,
				payload: payload,
				repeat: testRepeat,
				results: [],
				timeBegin: Date.now(),
				times: testCount,
				windowCount: windowCount
			};
	
			runPerformanceTestImpl();
		});
	};
	
	/**
	 * Runs the performance test.
	 */
	function runPerformanceTestImpl() {
		log('Sending a ' + testLog.payload.size + ' bytes message to ' + testLog.windowCount + ' windows, ' + testLog.times + ' times...');
		testLog.counter = 0;
		var testCount = testLog.times;
		while (testCount--) {
			postMessage('ping', { payload: testLog.payload });	
		}
	}
	
	/**
	 * Run the whole test suite.
	 */
	function runTests() {
		// If the windows are under manual control, just run the tests.
		if (!document.getElementById('autoWindow').checked) {
			runPerformanceTest();
			return;
		}
		
		// First close the other windows, then run the tests.
		closeOtherWindows(function () {
			openSlaveWindowOrHalt();
			setTimeout(function () {
				runPerformanceTest();
			}, 100);
		});
	}
	
	/**
	 * Instruct the window that it is a slave.
	 */
	function setIsSlave() {
		document.getElementById('slaveMessage').style.display = 'inline';
		document.getElementById('content').classList.add('slave');
	}
	
	// Export some functions.
	window.closeWindows = closeOtherWindows;
	window.countWindows = countWindows;
	window.openWindows = openWindows;
	window.runTests = runTests;
	window.setIsSlave = setIsSlave;
	
	// Signal that all is done.
	log('Ready.');
}());
