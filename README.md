# Replicated Developer Studio

This is an early version of the Replicated Developer Studio, designed to allow a developer to run a local API and quickly iterate while building a Replicated application.

## What it does do
The Replicated Developer Studio can provide YAML releases to Replicated for install and updates. This is designed to streamline the development cycle to allow for local yaml changes and testing new versions of your images.

## What it doesn't do
1. Licenses to install must still be valid. This service only handles a few endpoints in the Replicated API, and proxies all of the others to the primary API service. 
1. This service does respond to requests for custom branding, console logos, and some other metadata. All of these values are static and will not be served from the upstream API. This means that your local developer console will not show your application logo or branding, but this will still work when you promote your build using the real API.
1. This service doesn't enforce licenses to serve YAML. Any request to get YAML will be honored. This is designed to run on `localhost` for local development, so no license enforcements or policies were added.
1. If your application yaml includes [GitHub references](https://www.replicated.com/docs/kb/developer-resources/github-integration-config-files/) for config files, these won't be functional. If you are using this feature, you'll have to put the GitHub file inline for now.

## Configure Replicated to use this local API
- Start with a new installation of Replicated, or remove any previously install application.
- Configure Replicated by adding a `MARKET_BASE_URL` variable that points to the location of this Developer Studio service:
    - systemd:  add the variable to `/etc/default/replicated` ([see example](https://github.com/replicatedhq/studio/blob/master/config/systemd.md))
    - upstart: add the variable to `/etc/init/replicated`
- Restart Replicated


## Getting Started
To start the Developer Studio just clone this repo, install nodejs and [yarn](https://yarnpkg.com), and then run the following commands:
```bash
yarn
make build run
```

This API assumes you have a directory named `/replicated` that is readable by the user running the API. It will look in this directory for files named <sequence>.yaml and serve these as releases. It's important that you start with the sequence number that is the latest promoted version for the channel your license is in.

For example, here's a screenshot from a test app on Replicated.
![Replicated](https://github.com/replicatedhq/studio/blob/master/images/vendor-web.png). 

My license is in the unstable channel. To start with the Studio environment, I should create a file named `/replicated/16.yaml` locally, and put my application yaml in it. Once installed, I can create a new release simply by creating a file named `/replicated/<any int higher than 16>.yaml` and clicking the Check For Updates button in Replicated. After the initial installation, Replicated will not use the real API for any sequence numbers and it's ok to generate as many as you want locally.
