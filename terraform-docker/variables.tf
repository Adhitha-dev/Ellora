variable "container_name" {
  description = "Name of the Docker container"
  type        = string
  default     = "ellora-web"
}

variable "image_name" {
  description = "Docker image repository name"
  type        = string
  default     = "ellora-app"
}

variable "source_version" {
  description = "Application source code version or Git commit hash"
  type        = string
  default     = "latest"
}

variable "app_port" {
  description = "Host port to map to container port 3000"
  type        = number
  default     = 3000
}

variable "session_secret" {
  description = "Session secret key for authentication and sessions"
  type        = string
  default     = "ellora-terraform-docker-secret-key-2026"
}

variable "mongo_url" {
  description = "MongoDB connection URL (optional, skips DB connection if empty)"
  type        = string
  default     = ""
}

variable "admin_user" {
  description = "Admin username for Ellora application"
  type        = string
  default     = "admin"
}
