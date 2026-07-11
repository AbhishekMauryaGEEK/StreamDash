###############################################
# Public Route Table
###############################################

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.streamdash_vpc.id

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-public-route-table"
  })
}

###############################################
# Default Route to Internet
###############################################

resource "aws_route" "public_internet_access" {
  route_table_id = aws_route_table.public.id

  destination_cidr_block = "0.0.0.0/0"

  gateway_id = aws_internet_gateway.streamdash_igw.id
}

###############################################
# Route Table Association - Public Subnet 1
###############################################

resource "aws_route_table_association" "public_subnet_1" {
  subnet_id = aws_subnet.public_subnet_1.id

  route_table_id = aws_route_table.public.id
}

###############################################
# Route Table Association - Public Subnet 2
###############################################

resource "aws_route_table_association" "public_subnet_2" {
  subnet_id = aws_subnet.public_subnet_2.id

  route_table_id = aws_route_table.public.id
}

###############################################
# Private Route Table
###############################################

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.streamdash_vpc.id

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-private-route-table"
  })
}

###############################################
# Private Default Route via NAT Gateway
#
# Only created when enable_nat_gateway = true. Without it, private subnets have
# no egress to the internet (portfolio / cost-saving mode). See nat.tf.
###############################################

resource "aws_route" "private_nat_access" {
  count = var.enable_nat_gateway ? 1 : 0

  route_table_id = aws_route_table.private.id

  destination_cidr_block = "0.0.0.0/0"

  nat_gateway_id = aws_nat_gateway.streamdash_nat[0].id
}

###############################################
# Associate Private Subnet 1
###############################################

resource "aws_route_table_association" "private_subnet_1" {
  subnet_id = aws_subnet.private_subnet_1.id

  route_table_id = aws_route_table.private.id
}

###############################################
# Associate Private Subnet 2
###############################################

resource "aws_route_table_association" "private_subnet_2" {
  subnet_id = aws_subnet.private_subnet_2.id

  route_table_id = aws_route_table.private.id
}
