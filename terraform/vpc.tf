###############################################
# VPC
###############################################

resource "aws_vpc" "streamdash_vpc" {
  cidr_block = var.vpc_cidr

  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-vpc"
  })
}

###############################################
# Internet Gateway
###############################################

resource "aws_internet_gateway" "streamdash_igw" {
  vpc_id = aws_vpc.streamdash_vpc.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-igw"
  })
}
