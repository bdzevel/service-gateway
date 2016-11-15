let TS = require("../../diagnostics/trace-sources").get("Command-Service");

let Message = require("../../contracts/message");

// Dispatches commands to local services (within this node)
class CommandService {
	constructor() {
		TS.traceVerbose(__filename, "Initializing service...");
		this.initialize();
		TS.traceVerbose(__filename, "Finished initializing service");
	}
	
	initialize() {
		this.commandHandlers = { };
		this.configurationService = require("../configuration/configuration-service");
	}
	
	register(symbol, callback) {
		if (this.commandHandlers[symbol]) {
			let err = `Handler for '${symbol}' already registered`;
			TS.traceError(__filename, err);
			throw err;
		}
		this.commandHandlers[symbol] = function(msg) {
			validateMessage(msg);
			return callback(msg);
		};
	}

	dispatch(command) {
		let symbol = command.Symbol;
		TS.traceVerbose(__filename, `Received ${symbol}`);
		if (!this.commandHandlers[symbol]) {
			TS.traceWarning(__filename, `No handler registered for '${symbol}'`);
			return;
		}
		let response = this.commandHandlers[symbol](command);
		TS.traceVerbose(__filename, `Finished handling ${symbol}`);
		return response;
	}
}

function validateMessage(msg) {
	if (!(msg instanceof Message)) {
		let err = "Invalid message";
		TS.traceError(__filename, err);
		throw err;
	}
}

module.exports = new CommandService();