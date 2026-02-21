terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

resource "digitalocean_droplet" "this" {
  name   = var.name
  region = var.region
  size   = var.size
  image  = "ubuntu-24-04-x64"

  ssh_keys = var.ssh_keys
}

output "droplet_ip" {
  value = digitalocean_droplet.this.ipv4_address
}
