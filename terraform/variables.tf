# Input Variables for Ellora Infrastructure

variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
  default     = "rg-ellora-devops"
}

variable "location" {
  description = "Azure region where resources will be provisioned"
  type        = string
  default     = "East US"
}

variable "environment" {
  description = "Deployment environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "vnet_name" {
  description = "Name of the Virtual Network"
  type        = string
  default     = "vnet-ellora"
}

variable "vnet_address_space" {
  description = "Address space for the Virtual Network"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "subnet_name" {
  description = "Name of the Subnet within the VNet"
  type        = string
  default     = "snet-ellora"
}

variable "subnet_address_prefix" {
  description = "Address prefix for the Subnet"
  type        = list(string)
  default     = ["10.0.1.0/24"]
}

variable "public_ip_name" {
  description = "Name of the Public IP address resource"
  type        = string
  default     = "pip-ellora"
}

variable "nsg_name" {
  description = "Name of the Network Security Group"
  type        = string
  default     = "nsg-ellora"
}

variable "nic_name" {
  description = "Name of the Network Interface"
  type        = string
  default     = "nic-ellora"
}

variable "vm_name" {
  description = "Name of the Virtual Machine"
  type        = string
  default     = "vm-ellora-prod"
}

variable "vm_size" {
  description = "Azure VM SKU size (Standard_B1s is free-tier eligible)"
  type        = string
  default     = "Standard_B1s"
}

variable "admin_username" {
  description = "Administrator username for the Linux VM"
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key_path" {
  description = "Path to the SSH public key file for VM authentication"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}
