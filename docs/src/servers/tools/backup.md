# Backup

[restic](https://restic.net) snapshots `/opt/homelab/servers/tools` every night to S3 at another provider - `.env` files and the `data` of every service. Snapshots are encrypted before upload and deduplicated, so a daily snapshot stores only what changed.

All commands run in `/opt/homelab/servers/tools`.

## Install

```fish
sudo apt install restic
```

## Repository

Create a bucket at another provider than the tools server, then:

```fish
sudo cp restic.env.example restic.env
sudo chmod 600 restic.env
sudo vim restic.env
```

<<< @/../../servers/tools/restic.env.example{ini}

- `RESTIC_PASSWORD` - generate it in Vaultwarden, it encrypts every snapshot
- `AWS_DEFAULT_REGION` - the region your S3 expects, `us-east-1` if it doesn't care

> [!WARNING]
> keep `restic.env` outside Vaultwarden too - a printed copy or a second password manager. Vaultwarden is restored from these snapshots, and without the password they can't be decrypted

```fish
sudo ./restic.sh init
```

> [`restic.sh`](https://github.com/tednaaa/homelab/blob/main/servers/tools/restic.sh) runs `restic` with `restic.env` loaded - use it for every restic command

## Schedule

[`backup.sh`](https://github.com/tednaaa/homelab/blob/main/servers/tools/backup.sh) runs the pre-backup steps of services, snapshots the directory and keeps 7 daily, 4 weekly and 6 monthly snapshots.

```fish
echo '0 3 * * * root /opt/homelab/servers/tools/backup.sh >> /var/log/homelab-backup.log 2>&1' | sudo tee /etc/cron.d/homelab-backup
```

Run it once by hand and check the snapshot:

```fish
sudo ./backup.sh
sudo ./restic.sh snapshots
```

## Check

Once a month, read back a part of the uploaded data:

```fish
sudo ./restic.sh check --read-data-subset=5%
```

## Restore

On a new server, follow the [tools server setup](./index.md) up to [Clone](./index.md#clone), then install restic and create `restic.env` from the copy outside Vaultwarden.

Restore over the clone, then put tracked files back to the repository version:

```fish
sudo ./restic.sh restore latest --target / --include /opt/homelab/servers/tools
sudo git checkout -- .
```

Do the restore steps of each service, then [start](./index.md#start):

- [Vaultwarden](./vaultwarden.md#restore)
