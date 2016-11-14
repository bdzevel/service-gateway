let TS = require("../../diagnostics/trace-sources").get("Gateway-Service");

let Message = require("../../contracts/message");
let WebCall = require("./web-call");

let constants = require("../../resources/constants").Gateway;

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
		this.commandService.register(constants.Actions.Broadcast, msg => this.broadcastHandler(msg));
	}

    registerHandler(msg) {
        // Subscribe microservice to specified event over HTTP
        return this.register(msg.Arguments.Symbol, msg.Arguments.RequestURL, msg.Arguments.CallbackURL);
    }
    
    register(symbol, requestUrl, responseUrl) {
        let webCall = new WebCall(requestUrl, responseUrl);
		TS.traceVerbose(__filename, `Registering subscription for '${symbol}' at '${requestUrl}' (${webCall.Method})${responseUrl ? ` (response at ${responseUrl})` : ""}...`);
        if (this.subscriptions[symbol])
            this.subscriptions[symbol].push(webCall);
        else
            this.subscriptions[symbol] = [ webCall ];
		TS.traceVerbose(__filename, `Finished registering subscription for '${symbol}' at '${requestUrl}'`);
        return new Message(constants.Responses.Register);
    }

    broadcastHandler(msg) {
        // Publish specified event to all subscribers over HTTP
        var broadcastMsg = Message.fromJson(msg.Arguments);
        return this.broadcast(broadcastMsg);
    }

    broadcast(msg) {
		TS.traceVerbose(__filename, `Broadcasting '${msg.Symbol}' to all subscribers...`);
        if (this.subscriptions[msg.Symbol]) {
            let subs = this.subscriptions[msg.Symbol];
            for (let i in subs) {
                let webCall = subs[i];
		        TS.traceVerbose(__filename, `Publishing '${msg.Symbol}' at '${webCall.URL}'${webCall.Callback ? ` (expecting response at ${webCall.Callback.URL})` : ""}...`);
                setImmediate((wc, m) => this.webClient.sendRequest(wc, m), webCall, msg);
            }
        }
		TS.traceVerbose(__filename, `Finished broadcasting '${msg.Symbol}'`);
        return new Message(constants.Responses.Broadcast);
    }
}
module.exports = new GatewayService();