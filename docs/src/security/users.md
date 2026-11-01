# Users

Every person gets their own account on every server they need. Nobody works as `root`, nobody shares an account - `auth.log` and `sudo` logs then name who did what, and offboarding one person touches nothing else.

## Onboarding

The person sends their public key, never the private one. Ed25519 only:

```fish
ssh-keygen -t ed25519 -C <name>@<company>
cat ~/.ssh/id_ed25519.pub
```

On the server:

```fish
sudo adduser <user>
sudo usermod -aG sudo <user>
sudo install -d -m 700 -o <user> -g <user> /home/<user>/.ssh
echo '<public key>' | sudo install -m 600 -o <user> -g <user> /dev/stdin /home/<user>/.ssh/authorized_keys
```

`adduser` asks for a password - it is only for `sudo`, SSH never accepts it. Set a temporary one and have the person change it with `passwd` on first login. No `NOPASSWD`: with it a leaked key is a leaked root.

Leave out `usermod -aG sudo` for anyone who only needs to read logs or deploy.

## Offboarding

On every server the person had access to:

```fish
sudo pkill -KILL -u <user>
sudo crontab -r -u <user>
sudo deluser --remove-home <user>
```

`pkill` drops open sessions and `crontab -r` the person's cron jobs - `deluser` alone leaves both running.

Then rotate whatever the person could read with `sudo`: GitLab secrets, S3 keys, database passwords.

## Audit

Who can log in and who has `sudo`:

```fish
awk -F: '$7 !~ /(nologin|false)$/ {print $1}' /etc/passwd
getent group sudo
```

Every name should be a current employee. Any key in their `authorized_keys` should be one they sent:

```fish
sudo sh -c "grep -H '' /home/*/.ssh/authorized_keys"
```
