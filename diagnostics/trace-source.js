let Severity = require("./severity");

class TraceSource {
	constructor(name) {
		this.Name = name;
	}
	
	trace(severity, filepath, message) {
		if (severity == Severity.None)
			return;
		else if (severity == Severity.Information)
			this.traceInformation(filepath, message);
		else if (severity == Severity.Verbose)
			this.traceVerbose(filepath, message);
		else if (severity == Severity.Warning)
			this.traceWarning(filepath, message);
		else if (severity == Severity.Error)
			this.traceError(filepath, message);
	}
	
	traceInformation(filepath, message) {
		let msg = this.format(this.Name, filepath, message);
		console.info(msg);
	}

	traceVerbose(filepath, message) {
		let msg = this.format(this.Name, filepath, message);
		console.log(msg);
	}

	traceWarning(filepath, message) {
		let msg = this.format(this.Name, filepath, message);
		console.warn(msg);
	}

	traceError(filepath, message) {
		let msg = this.format(this.Name, filepath, message);
		console.error(msg);
	}

	format(traceName, filepath, message) {
		return ("[" + traceName + "] [" + filepath + "] " + message);
	}
}

module.exports = TraceSource;