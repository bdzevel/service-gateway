let TS = require("../../diagnostics/trace-sources").get("Configuration-Service");

let constants = require("../../resources/constants").Config;

class ConfigurationService {
	constructor() {
		TS.traceVerbose(__filename, "Initializing service...");
		this.initialize();
		TS.traceVerbose(__filename, "Finished initializing service");
	}
	
	initialize() {
		let Habitat = require("habitat");
		Habitat.load('.env');
		this.properties = new Habitat(constants.AppName);
	}
	
	get(property) {
		return this.properties.get(property);
	}
	
	set(name, value) {
		this.properties.set(name, value);
	}
}
module.exports = new ConfigurationService();