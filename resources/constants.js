module.exports = {
	Config: {
		AppName: "SERVICEGATEWAY"
	},
	Gateway: {
		Actions: {
			Register: "GATEWAY.COMMAND.REGISTER",
			Deregister: "GATEWAY.COMMAND.DEREGISTER",
			Dispatch: "GATEWAY.COMMAND.DISPATCH",
			Broadcast: "GATEWAY.COMMAND.BROADCAST"
		},
		Responses: {
			Register: "GATEWAY.RESPONSE.REGISTER",
			Deregister: "GATEWAY.RESPONSE.DEREGISTER",
			Dispatch: "GATEWAY.RESPONSE.DISPATCH",
			Broadcast: "GATEWAY.RESPONSE.BROADCAST"
		}
	}
 };