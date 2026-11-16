variable "aws_region" {
  description = "AWS region for the BookSwap laboratory environment."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name used in resource tags."
  type        = string
  default     = "dev"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{0,15}$", var.environment))
    error_message = "Use a short lowercase environment name, for example dev."
  }
}

variable "instance_type" {
  description = "EC2 x86_64 instance type; bootstrap adds swap for small instances."
  type        = string
  default     = "t3.micro"

  validation {
    condition     = contains(["t3.micro", "t3.small", "t3.medium"], var.instance_type)
    error_message = "Choose t3.micro, t3.small or t3.medium for this x86_64 lab."
  }
}

variable "repository_url" {
  description = "Public GitHub repository containing compose.production.yaml and the application."
  type        = string
  default     = "https://github.com/Melnik-Maks/bookswap.git"

  validation {
    condition     = can(regex("^https://github\\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(\\.git)?$", var.repository_url))
    error_message = "Use a public GitHub HTTPS clone URL without embedded credentials."
  }
}

variable "repository_ref" {
  description = "Published branch or tag to deploy. Use a release tag for a fixed version."
  type        = string
  default     = "main"

  validation {
    condition     = can(regex("^[A-Za-z0-9][A-Za-z0-9._/-]*$", var.repository_ref))
    error_message = "Use a branch or tag name containing letters, digits, dots, slashes, underscores or hyphens."
  }
}

variable "http_cidr" {
  description = "IPv4 CIDR allowed to open the BookSwap HTTP endpoint."
  type        = string
  default     = "0.0.0.0/0"

  validation {
    condition     = can(cidrnetmask(var.http_cidr))
    error_message = "Provide a valid IPv4 CIDR."
  }
}
