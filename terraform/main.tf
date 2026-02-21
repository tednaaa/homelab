terraform {
  backend "http" {}
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

data "terraform_remote_state" "moner" {
  backend = "http"
  config = {
    address  = var.gitlab_remote_state_address
    username = var.gitlab_username
    password = var.gitlab_access_token
  }
}

provider "digitalocean" {
  token = var.digital_ocean_token
}

module "services" {
  source   = "./modules/droplet"
  region   = var.region
  ssh_keys = var.ssh_fingerprints
  name     = "services"
  size     = "s-2vcpu-4gb"
}

# module "k8s" {
#   source     = "./modules/kubernetes"
#   region     = var.region
#   name       = "moner"
#   node_size  = "s-2vcpu-4gb"
#   node_count = 2
# }
