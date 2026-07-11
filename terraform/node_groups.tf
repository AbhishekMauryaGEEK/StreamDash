###############################################
# EKS Managed Node Group
###############################################

resource "aws_eks_node_group" "streamdash_nodes" {

  cluster_name = aws_eks_cluster.streamdash.name

  node_group_name = var.node_group_name

  node_role_arn = aws_iam_role.eks_node_role.arn

  subnet_ids = [
    aws_subnet.private_subnet_1.id,
    aws_subnet.private_subnet_2.id
  ]

  instance_types = [
    var.instance_type
  ]

  scaling_config {

    desired_size = var.desired_size

    min_size = var.min_size

    max_size = var.max_size
  }

  capacity_type = var.capacity_type

  ami_type = "AL2023_x86_64_STANDARD"

  depends_on = [
    aws_iam_role_policy_attachment.worker_node_policy,
    aws_iam_role_policy_attachment.ecr_read_only,
    aws_iam_role_policy_attachment.vpc_cni
  ]

  tags = merge(local.common_tags, {
    Name = var.node_group_name
  })
}
