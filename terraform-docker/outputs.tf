output "container_id" {
  description = "Docker Container ID"
  value       = docker_container.ellora.id
}

output "container_name" {
  description = "Docker Container Name"
  value       = docker_container.ellora.name
}

output "app_url" {
  description = "URL to access the Ellora application"
  value       = "http://localhost:${var.app_port}"
}

output "health_url" {
  description = "Application health endpoint URL"
  value       = "http://localhost:${var.app_port}/health"
}
