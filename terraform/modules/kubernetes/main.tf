terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

resource "digitalocean_kubernetes_cluster" "this" {
  name    = var.name
  region  = var.region
  version = "1.33.1-do.3"

  node_pool {
    name       = "default"
    size       = var.node_size
    node_count = var.node_count
  }
}
