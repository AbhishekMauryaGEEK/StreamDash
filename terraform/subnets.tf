###############################################
# Private Subnet 1
###############################################

resource "aws_subnet" "private_subnet_1" {

  vpc_id = aws_vpc.streamdash_vpc.id

  cidr_block = var.private_subnet_1_cidr

  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "${var.project_name}-private-subnet-1"

    "kubernetes.io/role/internal-elb" = "1"
  }
}

###############################################
# Private Subnet 2
###############################################

resource "aws_subnet" "private_subnet_2" {

  vpc_id = aws_vpc.streamdash_vpc.id

  cidr_block = var.private_subnet_2_cidr

  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "${var.project_name}-private-subnet-2"

    "kubernetes.io/role/internal-elb" = "1"
  }
}
