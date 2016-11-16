let TS = require("../../diagnostics/trace-sources").get("Gateway-Service");

let constants = require("../../resources/constants").Gateway;

let Message = require("../../contracts/message");
let WebCall = require("./web-call");

let Q = require("q");

// Dispatches events to registered/subscribed services, listening on specified endpoints
class GatewayService {
	constructor() {
		TS.traceVerbose(__filename, "Initializing service...");
		this.initialize();
		TS.traceVerbose(__filename, "Finished initializing service");
	}
	
	initialize() {
		this.subscriptions = { };
		this.webClient = require("../web/web-client");
		this.commandService = require("../command/command-service");
		this.configurationService = require("../configuration/configuration-service");
		this.commandService.register(constants.Actions.Register, msg => this.registerHandler(msg));
		this.commandService.register(constants.Actions.Deregister, msg => this.deregisterHandler(msg));
		this.commandService.register(constants.Actions.Dispatch, msg => this.dispatchHandler(msg));
		this.commandService.register(constants.Actions.Broadcast, msg => this.broadcastHandler(msg));
	}

	registerHandler(msg) {
		// Subscribe microservice to specified event over HTTP
		return Q.fcall((m) => {
			return this.register(m.getArgument("Symbol"), m.getArgument("RequestURL"));
		}, msg);
	}
	
	register(symbol, requestUrl) {
		let webCall = new WebCall(symbol, requestUrl);
		TS.traceVerbose(__filename, `Registering subscription for '${symbol}' at '${requestUrl}' (${webCall.Method})...`);
		if (this.subscriptions[symbol])
			this.subscriptions[symbol].push(webCall);
		else
			this.subscriptions[symbol] = [ webCall ];
		TS.traceVerbose(__filename, `Finished registering subscription for '${symbol}' at '${requestUrl}'`);
		return new Message(constants.Responses.Register);
	}

	deregisterHandler(msg) {
		return Q.fcall((m) => {
			return this.deregister(m.getArgument("Symbol"), m.getArgument("RequestURL"));
		}, msg);
	}

	deregister(symbol, requestUrl) {
		TS.traceVerbose(__filename, `Deregistering subscription for '${symbol}' at '${requestUrl}'...`);
		let subs = this.subscriptions[symbol];
		if (subs) {
			// Filter out any web calls going to this URL
			subs = subs.filter(wc => wc.URL !== requestUrl);
			if (subs.length === 0)
				delete this.subscriptions[symbol];
			else
				this.subscriptions[symbol] = subs;
		}
		TS.traceVerbose(__filename, `Finished deregistering subscription for '${symbol}' at '${requestUrl}'...`);
		return new Message(constants.Responses.Deregister);
	}

	dispatchHandler(msg) {
		// Dispatch command to a service over HTTP
		//  (assumes only one subscribing service per command)
		var dispatchMsg = Message.fromJson(msg.Arguments);
		let symbol = dispatchMsg.Symbol;
		TS.traceVerbose(__filename, `Dispatching '${symbol}'...`);
		let subs = this.subscriptions[symbol];
		if (!subs) {
			// Return simple promise to provide error message
			TS.traceWarning(__filename, `No handler registered for '${symbol}'`);
			return Q.fcall((s) => {
				let m = new Message(constants.Responses.Dispatch);
				m.addArgument("ErrorMessage", `No handler registered for '${s}'`);
				return m;
			}, symbol);
		}

		let webCall = subs[0];
		return this.sendRequest(webCall, dispatchMsg)
			.then(response => {
				TS.traceVerbose(__filename, `Finished dispatching '${symbol}'`);
				return response;
			});
	}

	broadcastHandler(msg) {
		// Publish specified event to all subscribers over HTTP
		var broadcastMsg = Message.fromJson(msg.Arguments);
		return Q.fcall((m) => {
			return this.broadcast(m);
		}, broadcastMsg);
	}

	broadcast(msg) {
		let symbol = msg.Symbol;
		TS.traceVerbose(__filename, `Broadcasting '${symbol}' to all subscribers...`);
		let subs = this.subscriptions[symbol];
		if (subs) {
			for (let i in subs) {
				let webCall = subs[i];
				TS.traceVerbose(__filename, `Publishing '${symbol}' at '${webCall.URL}'...`);
				this.sendRequest(webCall, msg);
			}
		}
		TS.traceVerbose(__filename, `Finished broadcasting '${symbol}'`);
		return new Message(constants.Responses.Broadcast);
	}

	sendRequest(webCall, message) {
		return this.webClient.sendRequest(webCall, message)
			.then(msg => { 
				webCall.ErrorCount = 0;
				return msg;
			}).fail(err => {
				webCall.ErrorCount++;
				if (webCall.ErrorCount >= 3) {
					setImmediate((wc) => {
						this.deregister(wc.Symbol, wc.URL);
					}, webCall);
				}
				throw err;
			});
	}
}

module.exports = new GatewayService();