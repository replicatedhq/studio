
shell:
	docker run -it -p 8006:8006 -v ${PWD}:/src --workdir /src --rm node:8 /bin/bash

