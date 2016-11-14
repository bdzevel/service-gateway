Service Gateway
=====

A gateway to be used in distributed, event-driven applications. Maintains list of subscriptions and routes commands/events to appropriate services.

* Node.js is the back end

Authored by Boris Dzevel

NOTES:

The "util" folder contains some helpful scripts:

1)

	generate-certificates.ps1
	A PowerShell script to generate the appropriate certificates that could be used for testing.
	It's not recommended to use these certificates for anything real because they won't be trusted by anyone.
	
2)

	install-cli-utils.ps1
	A PowerShell script that will install the necessary CLI utilities like grunt.
	This is easy enough to do manually. I just wanted a reminder of what I needed.
	
The app needs root-ca.crt.pem, server.key.pem, and server.crt.pem files at root (not checked in), for TLS. You can generate these using the script mentioned above and just move them to the root.

Needs .env file at root (not checked in), with following (JSON) structure:

	{
		"SERVICEGATEWAY_ENVIRONMENT": "development/production",
		"SERVICEGATEWAY_TLS_ENABLED": "0/1",
		"SERVICEGATEWAY_PORT": 3000
	}
