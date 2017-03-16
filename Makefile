deps:
	yarn

prebuild:
	rm -rf build

build: prebuild
	mkdir -p build
	./node_modules/.bin/tslint --project ./tsconfig.json
	./node_modules/.bin/tsc

clean:
	rm -rf build

help:
	node --no-deprecation ./bin/studio help

server:
	node --no-deprecation ./bin/studio server

