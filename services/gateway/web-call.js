class WebCall {
	constructor(symbol, requestURL) {
		this.Symbol = symbol;
		this.Method = "POST";
		this.URL = requestURL;
		this.ErrorCount = 0;
	}
}
module.exports = WebCall;