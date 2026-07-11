###############################################
# General / Project
###############################################

variable "aws_region" {
  description = "AWS region to deploy all resources into (e.g. ap-south-1)."
  type        = string

  validation {
    # Matches AWS region format like us-east-1, ap-south-1, eu-west-2.
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]$", var.aws_region))
    error_message = "aws_region must be a valid AWS region, e.g. ap-south-1."
  }
}

variable "project_name" {
  description = "Short project name used as a prefix for resource names and tags."
  type        = string

  validation {
    condition     = length(var.project_name) > 0 && can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "project_name must be non-empty and contain only lowercase letters, digits, and hyphens."
  }
}

variable "environment" {
  description = "Deployment environment name, applied as the Environment tag on every resource."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

###############################################
# Networking
###############################################

variable "vpc_cidr" {
  description = "CIDR block for the VPC. Must be large enough to contain all subnet CIDRs."
  type        = string

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "vpc_cidr must be a valid IPv4 CIDR block, e.g. 10.0.0.0/16."
  }
}

variable "public_subnet_1_cidr" {
  description = "CIDR block for public subnet 1 (first AZ). Must fall within vpc_cidr."
  type        = string

  validation {
    condition     = can(cidrhost(var.public_subnet_1_cidr, 0))
    error_message = "public_subnet_1_cidr must be a valid IPv4 CIDR block."
  }
}

variable "public_subnet_2_cidr" {
  description = "CIDR block for public subnet 2 (second AZ). Must fall within vpc_cidr."
  type        = string

  validation {
    condition     = can(cidrhost(var.public_subnet_2_cidr, 0))
    error_message = "public_subnet_2_cidr must be a valid IPv4 CIDR block."
  }
}

variable "private_subnet_1_cidr" {
  description = "CIDR block for private subnet 1 (first AZ). Must fall within vpc_cidr."
  type        = string

  validation {
    condition     = can(cidrhost(var.private_subnet_1_cidr, 0))
    error_message = "private_subnet_1_cidr must be a valid IPv4 CIDR block."
  }
}

variable "private_subnet_2_cidr" {
  description = "CIDR block for private subnet 2 (second AZ). Must fall within vpc_cidr."
  type        = string

  validation {
    condition     = can(cidrhost(var.private_subnet_2_cidr, 0))
    error_message = "private_subnet_2_cidr must be a valid IPv4 CIDR block."
  }
}

variable "enable_nat_gateway" {
  description = <<-EOT
    Whether to create a NAT Gateway (plus Elastic IP and private default route)
    so private subnets can reach the internet. Leave false for cheap dev/portfolio
    environments; set true when workloads in private subnets need outbound access.
  EOT
  type        = bool
  default     = false
}

###############################################
# EKS Cluster
###############################################

variable "cluster_name" {
  description = "Name of the Amazon EKS cluster."
  type        = string
  default     = "streamdash-cluster"
}

variable "kubernetes_version" {
  description = "Kubernetes control-plane version for the EKS cluster (e.g. 1.32)."
  type        = string
  default     = "1.32"

  validation {
    condition     = can(regex("^[0-9]+\\.[0-9]+$", var.kubernetes_version))
    error_message = "kubernetes_version must be in MAJOR.MINOR form, e.g. 1.32."
  }
}

###############################################
# EKS Managed Node Group
###############################################

variable "node_group_name" {
  description = "Name of the EKS managed node group."
  type        = string
  default     = "streamdash-node-group"
}

variable "instance_type" {
  description = "EC2 instance type for the managed node group worker nodes."
  type        = string
  default     = "t3.small"
}

variable "capacity_type" {
  description = "Purchasing option for node group instances: ON_DEMAND (stable) or SPOT (cheaper, interruptible)."
  type        = string
  default     = "ON_DEMAND"

  validation {
    condition     = contains(["ON_DEMAND", "SPOT"], var.capacity_type)
    error_message = "capacity_type must be either ON_DEMAND or SPOT."
  }
}

variable "desired_size" {
  description = "Desired number of worker nodes in the managed node group."
  type        = number
  default     = 2

  validation {
    condition     = var.desired_size >= 1
    error_message = "desired_size must be at least 1."
  }
}

variable "min_size" {
  description = "Minimum number of worker nodes the node group can scale down to."
  type        = number
  default     = 2

  validation {
    condition     = var.min_size >= 1
    error_message = "min_size must be at least 1."
  }
}

variable "max_size" {
  description = "Maximum number of worker nodes the node group can scale up to."
  type        = number
  default     = 3

  validation {
    condition     = var.max_size >= 1
    error_message = "max_size must be at least 1."
  }
}
