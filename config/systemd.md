# Configuring a systemd service to use the Developer Studio

A systemd service lissts an `EnvironmentFile` to use to load the local Replicated environment. This is normally set to `/etc/default/replicated`, unless changed. Adding the new environment variable to `/etc/default/replicated` and restarting the replicated service will make it use the local API.

The name of the environment variable is `MARKET_BASE_URL`. It cannot be set to "localhost" because it will be resolved inside the Replicated container. If running the studio service on the same server as Replicated, we recommend using the docker0 address. If you want to run the studio service locally, consider trying a [ZeroTier](https://www.zerotier.com) network to connect your local laptop and the cloud server you are installing on.

### `/etc/default/replicated`
```
RELEASE_CHANNEL=stable
PRIVATE_ADDRESS=<snip>
SKIP_OPERATOR_INSTALL=0
REPLICATED_OPTS="-e LOG_LEVEL=info -e DAEMON_TOKEN=<snip> -e NODENAME=<snip> -e MARKET_BASE_URL=http://172.17.0.1:8006"
```
