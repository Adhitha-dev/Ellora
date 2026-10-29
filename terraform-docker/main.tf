# Build Ellora Docker image from application source
resource "docker_image" "ellora" {
  name = var.image_name
  build {
    context    = abspath("${path.module}/..")
    dockerfile = "Dockerfile"
  }
  triggers = {
    package_json = filemd5("${path.module}/../package.json")
    dockerfile   = filemd5("${path.module}/../Dockerfile")
    index_js     = filemd5("${path.module}/../index.js")
  }
}

# Provision and run the containerized application
resource "docker_container" "ellora" {
  name    = var.container_name
  image   = docker_image.ellora.image_id
  restart = "always"

  ports {
    internal = 3000
    external = var.app_port
  }

  env = [
    "PORT=3000",
    "SESSION_SECRET=${var.session_secret}",
    "MONGO_URL=${var.mongo_url}",
    "ADMIN=${var.admin_user}",
    "NODE_ENV=production"
  ]

  healthcheck {
    test     = ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
    interval = "15s"
    timeout  = "3s"
    retries  = 3
  }
}
