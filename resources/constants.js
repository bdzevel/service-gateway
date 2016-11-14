module.exports = {
    Config: {
        AppName: "SERVICEGATEWAY"
    },
    Gateway: {
        Actions: {
            Register: "GATEWAY.COMMAND.REGISTER",
            Dispatch: "GATEWAY.COMMAND.DISPATCH",
            Broadcast: "GATEWAY.COMMAND.BROADCAST"
        },
        Responses: {
            Register: "GATEWAY.RESPONSE.REGISTER",
            Dispatch: "GATEWAY.RESPONSE.DISPATCH",
            Broadcast: "GATEWAY.RESPONSE.BROADCAST"
        }
    }
 };