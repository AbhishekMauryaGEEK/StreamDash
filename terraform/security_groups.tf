###############################################
# EKS Cluster Security Group
###############################################

resource "aws_security_group" "eks_cluster_sg" {
  name        = "${local.name_prefix}-eks-cluster-sg"
  description = "Security group for EKS Cluster"
  vpc_id      = aws_vpc.streamdash_vpc.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-eks-cluster-sg"
  })
}

###############################################
# Worker Node Security Group
###############################################

resource "aws_security_group" "eks_nodes_sg" {
  name        = "${local.name_prefix}-eks-node-sg"
  description = "Security group for EKS Worker Nodes"
  vpc_id      = aws_vpc.streamdash_vpc.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-eks-node-sg"
  })
}

###############################################
# Nodes -> Cluster API
###############################################

resource "aws_security_group_rule" "node_to_cluster" {
  type      = "ingress"
  from_port = 443
  to_port   = 443
  protocol  = "tcp"

  security_group_id        = aws_security_group.eks_cluster_sg.id
  source_security_group_id = aws_security_group.eks_nodes_sg.id
}

###############################################
# Cluster -> Nodes
###############################################

resource "aws_security_group_rule" "cluster_to_node" {
  type      = "ingress"
  from_port = 1025
  to_port   = 65535
  protocol  = "tcp"

  security_group_id        = aws_security_group.eks_nodes_sg.id
  source_security_group_id = aws_security_group.eks_cluster_sg.id
}

###############################################
# Node to Node Communication
###############################################

resource "aws_security_group_rule" "node_to_node" {
  type      = "ingress"
  from_port = 0
  to_port   = 65535
  protocol  = "-1"

  security_group_id        = aws_security_group.eks_nodes_sg.id
  source_security_group_id = aws_security_group.eks_nodes_sg.id
}
