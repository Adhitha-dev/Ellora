# Infrastructure as Code (Terraform on Microsoft Azure)

This directory contains production-ready Terraform scripts to provision all necessary Microsoft Azure infrastructure for running the **Ellora** web application.

---

## 🏛️ Architecture Overview

The Terraform configuration provisions:
- **Azure Resource Group**: Logical container for all project resources.
- **Virtual Network (VNet)**: `10.0.0.0/16` isolated private network.
- **Subnet**: `10.0.1.0/24` subnet for compute resources.
- **Static Public IP Address**: Standard SKU public IP for external web and SSH access.
- **Network Security Group (NSG)**: Configured with security rules:
  - Port `22` (SSH for administrative and CI/CD access).
  - Port `80` (HTTP web traffic).
  - Port `3000` (Direct application port).
- **Network Interface (NIC)**: Binds the VM to the subnet and public IP with NSG rules.
- **Linux Virtual Machine**: Ubuntu 22.04 LTS (`Standard_B1s` Free/Student Tier eligible).
- **Automated Cloud-Init (custom_data)**: Automatically installs Docker, Docker Compose, Git, and enables the Docker service on boot.

---

## 📋 Prerequisites

1. **Azure CLI**: Install Azure CLI (`curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash` or via official installer).
2. **Terraform**: Terraform CLI (>= 1.3.0).
3. **SSH Key Pair**: Generate if not already present:
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
   ```
4. **Azure Login**:
   ```bash
   az login
   ```

---

## 🚀 Deployment Instructions

### 1. Initialize Terraform
Downloads the AzureRM provider and initializes the state backend:
```bash
terraform init
```

### 2. Configure Variables (Optional)
Copy `terraform.tfvars.example` to `terraform.tfvars`:
```bash
cp terraform.tfvars.example terraform.tfvars
```
Edit `terraform.tfvars` if you want to change region, VM size, or SSH key path.

### 3. Review Plan
Preview the resources that will be provisioned:
```bash
terraform plan
```

### 4. Provision Infrastructure
Apply the configuration to Azure:
```bash
terraform apply -auto-approve
```

Upon completion, Terraform will output:
- `public_ip_address`: The IP of your new Azure VM.
- `ssh_command`: Ready-to-run SSH command to connect.
- `app_url_http`: Live web application URL.

### 5. Tear Down / Destroy
To avoid unexpected charges after completing evaluation:
```bash
terraform destroy -auto-approve
```
