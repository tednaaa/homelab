### Setup cluster

- Create Digital Ocean droplet to spin up k3s

#### Connect via ssh and [Install k3s](https://docs.k3s.io/quick-start)

```fish
curl -sfL https://get.k3s.io | sh -
```

#### This command will create `/etc/rancher/k3s/k3s.yaml`

- Copy that file to your PC `~/.kube/config`
- Update server, paste your droplet ip

```yaml
clusters:
  - cluster:
      certificate-authority-data: .....
      server: https://{your_server_ip}:6443
```

#### Congrats! now you can connect to your cluster

#### Setup fluxCD

```fish
flux bootstrap git \
  --url="ssh://git@github.com/tednaaa/homelab" \
  --branch="main" \
  --private-key-file="$HOME/.ssh/personal_git" \
  --path="clusters/production"
```
