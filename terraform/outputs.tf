# Terraform Outputs for Ellora Deployment

output "resource_group_name" {
  description = "Name of the provisioned Azure Resource Group"
  value       = azurerm_resource_group.rg.name
}

output "vm_name" {
  description = "Name of the provisioned Virtual Machine"
  value       = azurerm_linux_virtual_machine.vm.name
}

output "public_ip_address" {
  description = "Public IP address assigned to the Azure Virtual Machine"
  value       = azurerm_public_ip.pip.ip_address
}

output "ssh_command" {
  description = "Command to SSH into the provisioned Virtual Machine"
  value       = "ssh ${var.admin_username}@${azurerm_public_ip.pip.ip_address}"
}

output "app_url_http" {
  description = "Direct HTTP URL for the web application"
  value       = "http://${azurerm_public_ip.pip.ip_address}"
}

output "app_url_port_3000" {
  description = "Application port 3000 URL"
  value       = "http://${azurerm_public_ip.pip.ip_address}:3000"
}
