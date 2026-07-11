locals {
  # Single source of truth for the resource name prefix. Using this instead of
  # repeating "${var.project_name}-" everywhere means a project rename touches
  # exactly one line.
  name_prefix = var.project_name

  # Tags applied to every taggable resource via merge(). Per-resource "Name"
  # tags are layered on top with merge() at the call site.
  common_tags = {
    Project     = var.project_name
    ManagedBy   = "Terraform"
    Environment = var.environment
  }
}
