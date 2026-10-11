# SSH key-only login

Ubuntu ships with `PasswordAuthentication yes`. Bots brute-force port 22 non-stop, and any user created later with `adduser` becomes password-reachable from the internet immediately.

## Check current state

```fish
sudo sshd -T | grep -Ei 'passwordauthentication|kbdinteractive|pubkeyauthentication|permitrootlogin'
```

`sshd -T` resolves all `Include` drop-ins and prints what sshd actually runs with. Grepping `/etc/ssh/sshd_config` alone is misleading - most lines there are commented examples showing the default, not settings.

## Apply

Create a drop-in, do not edit `/etc/ssh/sshd_config`. First value wins and drop-ins load first, so `10-` overrides the `50-cloud-init.conf` that cloud images ship.

```fish
sudo vim /etc/ssh/sshd_config.d/10-hardening.conf
```

```
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
PermitRootLogin prohibit-password
```

`KbdInteractiveAuthentication` is the one people miss - with `UsePAM yes` it lets PAM prompt for a password even when `PasswordAuthentication no`.

Keep the current session open while reloading.

```fish
sudo sshd -t && sudo systemctl restart ssh.socket ssh.service

sudo sshd -T | grep -Ei 'passwordauthentication|kbdinteractive|permitrootlogin'
```

`sshd -t` validates syntax first, `&&` aborts the restart on a typo.

## Verify

From your laptop, in a NEW terminal:

```fish
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no root@your.server.ip
# expected: Permission denied (publickey).
```

No password prompt means it worked. Open one normal `ssh` session to confirm the key still works before closing the original.

## Audit

How much is hitting you, which usernames, which IPs:

```fish
sudo grep -cE 'Failed password|Invalid user' /var/log/auth.log
sudo grep -oP 'Invalid user \K\w+' /var/log/auth.log | sort | uniq -c | sort -rn | head -20
sudo grep -oP 'from \K[\d.]+' /var/log/auth.log | sort | uniq -c | sort -rn | head -10
```

Identical hit counts across several IPs means one operator splitting a wordlist over a rented pool. `fail2ban` bans per-IP and barely bites that, `PasswordAuthentication no` kills it outright.

Did anyone get in:

```fish
sudo grep -h 'Accepted' /var/log/auth.log; sudo zgrep -h 'Accepted' /var/log/auth.log.*.gz
```

Every line should be `Accepted publickey` from an IP you recognize. Any `Accepted password` needs investigating.

Accounts with a usable password (`L` = locked, nothing can match it):

```fish
sudo passwd -S root
sudo awk -F: '($2 ~ /^\$/) {print $1}' /etc/shadow   # empty is good
```

Persistence and payload checks:

```fish
# only keys you recognize
sudo cat /root/.ssh/authorized_keys

# only 22/80/443
sudo ss -tulpn | grep -v '127.0.0.1\|::1'

# cryptominers pin the CPU
top -bn1 | head -15

# only your IPs
last -20
```

If any of those come back dirty, rebuild the box rather than cleaning it - a compromised host cannot be trusted to report on itself.

## Note on hourly pubkey failures

```
userauth_pubkey: signature algorithm ssh-rsa not in PubkeyAcceptedAlgorithms [preauth]
```

OpenSSH 8.8+ rejects RSA keys signed with SHA-1. Repeating on a precise schedule means it is your own automation (CI, backup, monitoring) with an old key, not a bot. Trace it by PID to find the source:

```fish
sudo grep 'sshd\[114034\]' /var/log/auth.log
```

Fix the client to use Ed25519 or `rsa-sha2-256` rather than re-enabling `ssh-rsa` on the server.
