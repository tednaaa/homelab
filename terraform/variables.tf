variable "gitlab_remote_state_address" {
  type        = string
  description = "https://gitlab.com/api/v4/projects/<TARGET-PROJECT-ID>/terraform/state/<TARGET-STATE-NAME>"
}

variable "gitlab_username" {
  type        = string
  description = "Gitlab username"
}

variable "gitlab_access_token" {
  type        = string
  description = "GitLab access token"
  sensitive   = true
}

variable "digital_ocean_token" {
  type        = string
  description = "https://cloud.digitalocean.com/account/api/tokens"
  sensitive   = true
}

variable "ssh_fingerprints" {
  type        = list(string)
  description = "https://cloud.digitalocean.com/account/security"
}

variable "region" {
  type    = string
  default = "fra1"
}
