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
	}

    sendRequest(webCall, payload) {
        let requestOptions = {
            method: webCall.Method,
            body: payload,
            dataType: "json"
        };
        let responseMessagePromise = this.client.request(webCall.URL, requestOptions)
            .then(function(response) {
                return Message.fromJson(response.getBody());
            }, function(response) {
                let code = response.getCode();
                let body = response.getBody();
                let msg = Message.fromJson(body);
                let errMessage = msg.getArgument("Error");
                if (!errMessage)
                    errMessage = body.message;
                TS.traceError(__filename, `Error ${code}. ${errMessage}`);
                return msg;
            });
        if (webCall.Callback) {
            let callback = function(responseMsg) {
                return this.sendRequest(webCall.Callback, responseMsg);
            }
            responseMessagePromise.then(callback);
        }
        return responseMessagePromise;
    }
}
module.exports = new WebClient();