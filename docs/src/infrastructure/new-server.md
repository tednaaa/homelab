# New server

Base setup every VPS gets before its service. Written for Ubuntu 24.04 LTS.

## DNS

Before anything on the VPS, create an `A` record for the service domain pointing to the VPS IP - it propagates while the server is being set up.

> request a certificate only once `dig` returns the new IP - see [Let's Encrypt](../certificates/lets-encrypt.md)

## SSH

[Create an admin user, disable password and root login, set up fail2ban](../security/ssh.md). Then an account for [every other person](../security/users.md).

## System packages

```fish
sudo apt update && sudo apt upgrade -y
sudo apt install fish
```

## Security updates

Ubuntu installs packages from `-security` daily through `unattended-upgrades`. Check it is on:

```fish
cat /etc/apt/apt.conf.d/20auto-upgrades
# expected: both values "1"
sudo unattended-upgrade --dry-run -d
```

If the file is missing, `sudo dpkg-reconfigure -plow unattended-upgrades` creates it.

A new kernel or libc only takes effect after a reboot, so let it reboot at night:

```fish
sudo vim /etc/apt/apt.conf.d/52reboot
```

```
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
```

It reboots only when an update asked for it - `/var/run/reboot-required` exists. Log: `/var/log/unattended-upgrades/unattended-upgrades.log`.

> GitLab and Docker come from their own repositories, outside `Allowed-Origins`, so they still update by hand - `gitlab-ee` is also held

> a reboot at 04:00 kills a CI job running on the runners server at that moment

## Fish

Keep bash as the login shell - `ssh host 'cmd'`, `rsync` and `scp` expect POSIX. Start fish for interactive sessions only:

```fish
printf '\n\n[[ $- == *i* && -z $FISH_STARTED ]] && FISH_STARTED=1 exec fish' >> ~/.bashrc
```

## Provider VPS backups

- one checkbox in the provider panel, usually +20% of the VPS price
- the whole disk restores in minutes
- dies together with the provider account, so every service also needs an off-site backup
