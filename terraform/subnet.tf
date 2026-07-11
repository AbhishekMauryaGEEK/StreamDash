###############################################
# Public Subnet 1
###############################################

resource "aws_subnet" "public_subnet_1" {

  vpc_id = aws_vpc.streamdash_vpc.id

  cidr_block = var.public_subnet_1_cidr

  availability_zone = data.aws_availability_zones.available.names[0]

  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-1"

    "kubernetes.io/role/elb" = "1"
  }
}

###############################################
# Public Subnet 2
###############################################

resource "aws_subnet" "public_subnet_2" {

  vpc_id = aws_vpc.streamdash_vpc.id

  cidr_block = var.public_subnet_2_cidr

  availability_zone = data.aws_availability_zones.available.names[1]

  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-2"

    "kubernetes.io/role/elb" = "1"
  }
}
