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
		this.commandService.register(constants.Actions.Dispatch, msg => this.dispatchHandler(msg));
		this.commandService.register(constants.Actions.Broadcast, msg => this.broadcastHandler(msg));
	}

    registerHandler(msg) {
        // Subscribe microservice to specified event over HTTP
        return Q.fcall((m) => {
            return this.register(msg.Arguments.Symbol, msg.Arguments.RequestURL, msg.Arguments.CallbackURL);
        }, msg);
    }
    
    register(symbol, requestUrl) {
        let webCall = new WebCall(requestUrl);
		TS.traceVerbose(__filename, `Registering subscription for '${symbol}' at '${requestUrl}' (${webCall.Method})...`);
        if (this.subscriptions[symbol])
            this.subscriptions[symbol].push(webCall);
        else
            this.subscriptions[symbol] = [ webCall ];
		TS.traceVerbose(__filename, `Finished registering subscription for '${symbol}' at '${requestUrl}'`);
        return new Message(constants.Responses.Register);
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
            }, symbol);
		}

        let webCall = subs[0];
        let dispatchPromise = this.webClient.sendRequest(webCall, dispatchMsg);
		TS.traceVerbose(__filename, `Finished dispatching '${symbol}'...`);
        return dispatchPromise;
    }

    broadcastHandler(msg) {
        // Publish specified event to all subscribers over HTTP
        var broadcastMsg = Message.fromJson(msg.Arguments);
        return Q.fcall((m) => {
            return this.broadcast(m);
        }, broadcastMsg);
    }

    broadcast(msg) {
		TS.traceVerbose(__filename, `Broadcasting '${msg.Symbol}' to all subscribers...`);
        let subs = this.subscriptions[msg.Symbol];
        if (subs) {
            for (let i in subs) {
                let webCall = subs[i];
                TS.traceVerbose(__filename, `Publishing '${msg.Symbol}' at '${webCall.URL}'...`);
                this.webClient.sendRequest(webCall, msg);
            }
        }
		TS.traceVerbose(__filename, `Finished broadcasting '${msg.Symbol}'`);
        return new Message(constants.Responses.Broadcast);
    }
}
module.exports = new GatewayService();