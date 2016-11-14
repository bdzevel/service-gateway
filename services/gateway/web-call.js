class WebCall {
    constructor(requestURL, responseCallbackURL) {
        this.Method = "POST";
        this.URL = requestURL;
        if (responseCallbackURL)
            this.Callback = new WebCall(responseCallbackURL);
    }
}
module.exports = WebCall;