output "vpc_id" {
  value = aws_vpc.streamdash_vpc.id
}

output "vpc_cidr" {
  value = aws_vpc.streamdash_vpc.cidr_block
}
