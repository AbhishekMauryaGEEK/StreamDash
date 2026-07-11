###############################################
# Private Subnet 1
###############################################

resource "aws_subnet" "private_subnet_1" {
  vpc_id = aws_vpc.streamdash_vpc.id

  cidr_block = var.private_subnet_1_cidr

  availability_zone = data.aws_availability_zones.available.names[0]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-private-subnet-1"

    # Tells the AWS Load Balancer Controller this subnet is for internal ELBs.
    "kubernetes.io/role/internal-elb" = "1"
  })
}

###############################################
# Private Subnet 2
###############################################

resource "aws_subnet" "private_subnet_2" {
  vpc_id = aws_vpc.streamdash_vpc.id

  cidr_block = var.private_subnet_2_cidr

  availability_zone = data.aws_availability_zones.available.names[1]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-private-subnet-2"

    "kubernetes.io/role/internal-elb" = "1"
  })
}
