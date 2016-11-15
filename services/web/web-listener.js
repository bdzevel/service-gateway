let TS = require("../../diagnostics/trace-sources").get("Web-Listener");

let Message = require("../../contracts/message.js");

class WebListener {
	constructor() {
		TS.traceVerbose(__filename, "Initializing Web Listener...");
		this.initialize();
		TS.traceVerbose(__filename, "Finished initializing Web Listener");
	}
	
	initialize() {
		this.commandService = require("../command/command-service");
		this.configurationService = require("../configuration/configuration-service");
		this.port = this.normalizePort(process.env.PORT || this.configurationService.get("PORT"));
		this.initializeWebServer();
	}

	normalizePort(val) {
		let port = parseInt(val, 10);
		if (isNaN(port))
			return val;
		if (port >= 0)
			return port;
		return false;
	}
	
	initializeWebServer() {
		this.webServer = { };
		let sslEnabled = this.configurationService.get("TLS_ENABLED");
		if (sslEnabled === 0) {
			this.webServer = this.setupHttp();
		}
		else if (sslEnabled === 1) {
			this.webServer = this.setupHttps();
		}
		else {
			TS.traceError(__filename, "TLS_ENABLED option must be either '0' or '1'");
			process.exit(2);
		}
		this.webServer.on("error", this.onError);
	}
	
	setupHttp() {
		TS.traceVerbose(__filename, "Initializing HTTP server...");

		let http = require("http");
		let handlers = this.setupHttpHandlers();
		let server = http.createServer(handlers);

		TS.traceVerbose(__filename, "Finished initializing HTTP server");
		
		return server;
	}
	
	setupHttps() {
		TS.traceVerbose(__filename, "Initializing HTTPS server...");

		let https = require("https");
		let handlers = this.setupHttpHandlers();

		// These file reads used to be "Promisified" and "Async" but
		//	redesign of the structure caused some issues, and
		//	honestly async here is unnecessary, as this server must
		//	be up for anything to work.
		let fs = require("fs");
		let httpsOptions = {
			key: fs.readFileSync("server.key.pem"),
			cert: fs.readFileSync("server.crt.pem")
		};
		let server = https.createServer(httpsOptions, handlers);

		TS.traceVerbose(__filename, "Finished initializing HTTPS server");
		return server;
	}
	
	setupHttpHandlers() {
		TS.traceVerbose(__filename, "Initializing HTTP request handlers...");

		let express = require("express");
		let app = express();

		let logger = require("morgan");
		app.use(logger("dev"));

		let bodyParser = require("body-parser");
		app.use(bodyParser.json());
		
		let route = express.Router();
		route.post("/", (req, res) => {
			let message = Message.fromJson(req.body);
			let dispatchPromise = this.commandService.dispatch(message);
			dispatchPromise.then(responseMsg => {
				res.status(200).send(responseMsg);
			});
		});
		app.use(route);

		// Catch 404 and forward to error handler
		app.use(function (req, res, next) {
			let err = new Error("Not Found");
			err.status = 404;
			next(err);
		});

		app.use(function (err, req, res, next) {
			TS.traceError(__filename, err.message);
			res.status(err.status || 500).send({ error: err.message });
		});

		TS.traceVerbose(__filename, "Finished initializing HTTP request handlers");
		return app;
	}
	
	start() {
		TS.traceVerbose(__filename, "Starting web server on port " + this.port);
		this.webServer.listen(this.port);
		TS.traceVerbose(__filename, "Started web server");
	}

	onError(error) {
		if (error.syscall !== "listen") {
			throw error;
		}

		let bind = typeof this.port === "string"
			? "Pipe " + this.port
			: "Port " + this.port;

		// handle specific listen errors with friendly messages
		switch (error.code) {
			case "EACCES":
				TS.traceError(__filename, bind + " requires elevated privileges");
				process.exit(1);
				break;
			case "EADDRINUSE":
				TS.traceError(__filename, bind + " is already in use");
				process.exit(1);
				break;
			default:
				throw error;
		}
	}
}
module.exports = new WebListener();