let TS = require("../../diagnostics/trace-sources").get("Gateway-Service");

let Message = require("../../contracts/message");
let WebCallback = require("./web-callback");

let constants = require("../../resources/constants").Gateway;

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
        return this.register(msg.Arguments.Symbol, msg.Arguments.URL);
    }
    
    register(symbol, callbackUrl, method) {
        let callback = new WebCallback(symbol, callbackUrl, method);
		TS.traceVerbose(__filename, `Registering subscription for '${symbol}' at '${callbackUrl}' (${callback.Method})...`);
        if (this.subscriptions[symbol])
            this.subscriptions[symbol].push(callback);
        else
            this.subscriptions[symbol] = [ callback ];
		TS.traceVerbose(__filename, `Finished registering subscription for '${symbol}' at '${callbackUrl}'`);
    }

    dispatchHandler(msg) {
        var dispatchMsg = Message.fromJson(msg.Arguments);
        return this.dispatch(dispatchMsg);
    }

    dispatch(msg) {
		TS.traceVerbose(__filename, `Dispatching '${msg.Symbol}'...`);

        // Dispatch a "command" message, and expect a response
        if (!this.subscriptions[msg.Symbol]) {
            let response = new Message(constants.Responses.Dispatch);
            response.addArgument("Error", `No handler registered for '${msg.Symbol}'`)
            return response;
        }

        // Dispatch assumes there is only one handler, or it invokes the first one registered
        let callback = this.subscriptions[msg.Symbol][0];
        let response = this.webClient.sendRequest(callback.Method, callback.URL, msg);
		TS.traceVerbose(__filename, `Finished dispatching '${msg.Symbol}' to '${callback.URL}'`);
        return response;
    }

    broadcastHandler(msg) {
        var broadcastMsg = Message.fromJson(msg.Arguments);
        return this.broadcast(broadcastMsg.Symbol,broadcastMsgmsg.Arguments);
    }

    broadcast(msg) {
		TS.traceVerbose(__filename, `Broadcasting '${msg.Symbol}' to all subscribers...`);

        // Broadcast an "event" message. Do not expect a response.
        if (this.subscriptions[msg.Symbol]) {
            let subs = this.subscriptions[msg.Symbol];
            for (let i in subs) {
                let callback = subs[i];
		        TS.traceVerbose(__filename, `Publishing '${msg.Symbol}' at '${callback.URL}'...`);
                setImmediate((method, url, msg) => this.webClient.sendRequest(method, url, msg), callback.Method, callback.URL, msg);
            }
        }
		TS.traceVerbose(__filename, `Finished broadcasting '${msg.Symbol}'`);
        return new Message(constants.Responses.Broadcast);
    }
}
module.exports = new GatewayService();