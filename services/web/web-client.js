let TS = require("../../diagnostics/trace-sources").get("Web-Client");

let Message = require("../../contracts/message");

class WebClient {
	constructor() {
		TS.traceVerbose(__filename, "Initializing Web Client...");
		this.initialize();
		TS.traceVerbose(__filename, "Finished initializing Web Client");
	}
	
	initialize() {
		this.client = require('requestify');
		this.gatewayService = require("../gateway/gateway-service");
	}

	sendRequest(webCall, payload) {
		let requestOptions = {
			method: webCall.Method,
			body: payload,
			dataType: "json"
		};
		return this.client.request(webCall.URL, requestOptions)
			.then(function(response) {
				return Message.fromJson(response.getBody());
			});
	}
}
module.exports = new WebClient();