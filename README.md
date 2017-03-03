# Replicated Developer Studio

This is an early version of the Replicated Developer Studio, designed to allow a developer to run a local API and quickly iterate while building a Replicated application.

## What it does do
The Replicated Developer Studio can provide YAML releases to Replicated for install and updates. This is designed to be used during the developer cycle to avoid the iterative loop of pasting YAML into vendor.replicated.com, promoting the release and installing. 

## What it doesn't do
1. Licenses to install must still be valid. This service only handles a few endpoints in the Replicated API, and proxies all of the others to the primary API service. 
1. This service does respond to requests for custom branding, console logos, and some other metadata. All of these values are static and will not be served from the upstream API. This means that your local developer console will not show your application logo or branding, but this will still work when you promote your build using the real API.
1. This service doesn't enforce licenses to serve YAML. Any request to get YAML will be honored. This is designed to run on `localhost` for local development, so no license enforcements or policies were added.

## Configure Replicated to use this local API
- Start with a new installation of Replicated, or remove any previously install application.
- Configure Replicated by adding a `MARKET_BASE_URL` variable that points to the location of this Developer Studio service:
    - systemd:  add the variable to `/etc/default/replicated` ([see example](https://github.com/replicatedhq/studio/blob/master/config/systemd.md))
    - upstart: add the variable to `/etc/init/replicated`


## Getting Started
To start the Developer Studio listening on localhost:8006, just clone this repo and run the following commands:
```bash
yarn
make build run
```

