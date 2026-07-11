###############################################
# NAT Gateway (optional)
#
# Toggled by var.enable_nat_gateway. When false (default), no EIP or NAT
# Gateway is created and private subnets have no outbound internet access
# — this keeps a portfolio/dev environment cheap (a NAT Gateway bills hourly
# plus per-GB). When true, private subnets egress through a single NAT Gateway
# placed in public_subnet_1.
#
# NOTE: This uses a single NAT Gateway to minimise cost. For production HA you
# would provision one NAT Gateway per AZ; that is intentionally out of scope
# here to avoid changing the existing 2-AZ architecture.
###############################################

resource "aws_eip" "nat" {
  count = var.enable_nat_gateway ? 1 : 0

  domain = "vpc"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-nat-eip"
  })
}

resource "aws_nat_gateway" "streamdash_nat" {
  count = var.enable_nat_gateway ? 1 : 0

  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public_subnet_1.id

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-nat-gateway"
  })

  # The IGW must exist before a NAT Gateway can route to the internet.
  depends_on = [aws_internet_gateway.streamdash_igw]
}
