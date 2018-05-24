.PHONY: install-dependencies run-app

install-dependencies:
	npm install restify geolib

run-app:
	node app.js