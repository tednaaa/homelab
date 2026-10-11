# New server

Base setup every VPS gets before its service. Written for Ubuntu 24.04 LTS.

## DNS

Before anything on the VPS, create an `A` record for the service domain pointing to the VPS IP - it propagates while the server is being set up.

> request a certificate only once `dig` returns the new IP - see [Let's Encrypt](../certificates/lets-encrypt.md)

## SSH

[Disable password login](../security/ssh.md).

## System packages

```fish
sudo apt update && sudo apt upgrade -y
sudo apt install fish
```

## Fish

Keep bash as the login shell - `ssh host 'cmd'`, `rsync` and `scp` expect POSIX. Start fish for interactive sessions only:

```fish
printf '\n\n[[ $- == *i* && -z $FISH_STARTED ]] && FISH_STARTED=1 exec fish' >> ~/.bashrc
```

## Firewall

Allow only the ports the service needs, usually `22`, `80` and `443`, in the provider's cloud firewall, not in `ufw`.

> ports published by Docker bypass `ufw` - Docker writes its own iptables rules, so a closed `ufw` port stays open

## Provider VPS backups

- one checkbox in the provider panel, usually +20% of the VPS price
- the whole disk restores in minutes
- dies together with the provider account, so every service also needs an off-site backup
