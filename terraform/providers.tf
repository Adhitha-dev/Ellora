# Terraform and Azure Provider Configuration
terraform {
  required_version = ">= 1.3.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
  }

  # Backend state configuration
  # By default, state is stored locally in terraform.tfstate
  # For team collaboration / remote state, configure an Azure Storage Account backend:
  # backend "azurerm" {
  #   resource_group_name  = "rg-terraform-state"
  #   storage_account_name = "stelloradefaultstate"
  #   container_name       = "tfstate"
  #   key                  = "ellora.terraform.tfstate"
  # }
}

provider "azurerm" {
  features {}
}
