## Flux setup in GitLab

- Setup K8S however you like, for example using Digital Ocean
- Save the kubeconfig file to `~/.kube/config`

### Init flux in git repo

```fish
flux bootstrap git \
  --url="ssh://git@gitlab.com/owner/repo" \
  --branch="main" \
  --private-key-file="$HOME/.ssh/personal_git" \
  --path="clusters/production" \
  --components-extra="image-reflector-controller,image-automation-controller"
```

### Configure access to container registry

> need to pass token `read_registry` with `Maintainer role` and `read_registry` scope

```fish
export GITLAB_TOKEN=""
export GITLAB_USERNAME=""
export GITLAB_REGISTRY="registry.gitlab.com"

set namespaces "frontend" "flux-system"

for namespace in $namespaces
  kubectl create secret docker-registry docker-registry \
    --docker-server=$GITLAB_REGISTRY \
    --docker-username=$GITLAB_USERNAME \
    --docker-password=$GITLAB_TOKEN \
    --namespace=$namespace
end
```

### Force update flux

```fish
flux reconcile source git flux-system
```
