###############################################
# Terraform Backend
#
# State is kept locally by default (terraform.tfstate in this directory), which
# is fine for a single operator / portfolio project.
#
# To move to shared, locked remote state, create an S3 bucket and a DynamoDB
# lock table, then swap the local backend below for the commented S3 block and
# run `terraform init -migrate-state`.
###############################################

terraform {
  backend "local" {
    path = "terraform.tfstate"
  }

  # backend "s3" {
  #   bucket         = "streamdash-terraform-state"   # pre-created S3 bucket
  #   key            = "eks/terraform.tfstate"        # object key within the bucket
  #   region         = "ap-south-1"
  #   dynamodb_table = "streamdash-terraform-locks"   # pre-created lock table (LockID PK)
  #   encrypt        = true
  # }
}
