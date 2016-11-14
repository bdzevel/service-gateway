module.exports = {
    Config: {
        AppName: "SERVICEGATEWAY"
    },
    Gateway: {
        Actions: {
            Register: "GATEWAY.COMMAND.REGISTER",
            Broadcast: "GATEWAY.COMMAND.BROADCAST"
        },
        Responses: {
            Register: "GATEWAY.RESPONSE.REGISTER",
            Broadcast: "GATEWAY.RESPONSE.BROADCAST"
        }
    }
 };