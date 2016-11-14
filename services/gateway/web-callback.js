class WebCallback {
    constructor(symbol, url, method) {
        this.Symbol = symbol;
        this.URL = url;
        this.Method = method ? method : "POST";
    }
}
module.exports = WebCallback;