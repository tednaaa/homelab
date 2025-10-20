# Selhost GitLab

- in server change ssh port `/etc/ssh/sshd_config` to something like `Port = 2424`
- then in your local ssh config file add configuration for connection with new port

```
Host gitlab_droplet
	HostName {your_droplet_ip}
	Port 2424
	User root
	IdentityFile ~/.ssh/private_ssh_key
```

Refer to [gitlab docs](https://docs.gitlab.com/install/docker/installation) for more information about installing GitLab with docker compose

- after successful installation, you can access your gitlab website at your domain
- to login, use default `root` username and password you can find in `/etc/gitlab/initial_root_password`
- after login change the `root` password and also deactivate sign-ups
