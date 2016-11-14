class Message {
    constructor(symbol) {
        this.Symbol = symbol;
        this.Arguments = { };
    }
	
	static fromJson(json) {
		let msg = new Message(json.Symbol);
		if (json.Arguments)
			json.Arguments.forEach(name => msg.addArgument(name, json.Arguments[name]), this);
		return msg;
	}
	
	addArgument(name, value) {
		if (this.Arguments[name])
			throw "Argument with name '" + name + "' already added";
		this.Arguments[name] = value;
	}
	
	getArgument(name) {
        return this.Arguments[name];
	}
}
module.exports = Message;