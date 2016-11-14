let TS = require("../../diagnostics/trace-sources").get("Web-Client");

class WebClient {
	constructor() {
		TS.traceVerbose(__filename, "Initializing Web Client...");
		this.initialize();
		TS.traceVerbose(__filename, "Finished initializing Web Client");
	}
	
	initialize() {
        this.client = require('requestify');
	}

    sendRequest(method, url, payload) {
        let requestOptions = {
            method: method,
            body: payload,
            dataType: "json"
        };
        this.client.request(url, requestOptions)
            .fail(function(response) {
                let code = response.getCode();
                let body = response.getBody();
                TS.traceError(__filename, `Error ${code}: ${body.message}`);
            });
    }
}
module.exports = new WebClient();