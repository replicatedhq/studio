
shell:
	docker run -it --rm \
		-p 8006:8006 \
		-e STUDIO_UPSTREAM_BASE_URL=https://api.staging.replicated.com/market \
		-v ${PWD}:/src \
		-v ${HOME}/replicated:/replicated \
		--workdir /src \
		node:8 /bin/bash
