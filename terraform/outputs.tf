###############################################
# Networking Outputs
###############################################

output "vpc_id" {
  description = "ID of the VPC."
  value       = aws_vpc.streamdash_vpc.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC."
  value       = aws_vpc.streamdash_vpc.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets."
  value = [
    aws_subnet.public_subnet_1.id,
    aws_subnet.public_subnet_2.id
  ]
}

output "private_subnet_ids" {
  description = "IDs of the private subnets."
  value = [
    aws_subnet.private_subnet_1.id,
    aws_subnet.private_subnet_2.id
  ]
}

output "nat_gateway_id" {
  description = "ID of the NAT Gateway, or null when enable_nat_gateway is false."
  value       = try(aws_nat_gateway.streamdash_nat[0].id, null)
}

###############################################
# Security Group Outputs
###############################################

output "cluster_security_group_id" {
  description = "ID of the EKS cluster security group."
  value       = aws_security_group.eks_cluster_sg.id
}

output "node_security_group_id" {
  description = "ID of the EKS worker node security group."
  value       = aws_security_group.eks_nodes_sg.id
}

###############################################
# EKS Outputs
###############################################

output "cluster_name" {
  description = "Name of the EKS cluster."
  value       = aws_eks_cluster.streamdash.name
}

output "cluster_endpoint" {
  description = "Endpoint of the EKS Kubernetes API server."
  value       = aws_eks_cluster.streamdash.endpoint
}

output "cluster_arn" {
  description = "ARN of the EKS cluster."
  value       = aws_eks_cluster.streamdash.arn
}

output "cluster_certificate_authority_data" {
  description = "Base64-encoded certificate authority data for the cluster."
  value       = aws_eks_cluster.streamdash.certificate_authority[0].data
}

output "node_group_name" {
  description = "Name of the EKS managed node group."
  value       = aws_eks_node_group.streamdash_nodes.node_group_name
}

output "node_role_arn" {
  description = "ARN of the IAM role assumed by the worker nodes."
  value       = aws_iam_role.eks_node_role.arn
}

###############################################
# Convenience
###############################################

output "configure_kubectl" {
  description = "Ready-to-run command to update your local kubeconfig for this cluster."
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.streamdash.name}"
}
