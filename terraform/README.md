# StreamDash — AWS EKS Infrastructure (Terraform)

Terraform configuration that provisions the AWS foundation for running the
StreamDash application on a managed Kubernetes cluster (Amazon EKS).

## What this creates

| Layer            | Resources |
|------------------|-----------|
| **Networking**   | 1 VPC, 1 Internet Gateway, 2 public subnets, 2 private subnets (across 2 AZs), public + private route tables, and an **optional** NAT Gateway |
| **IAM**          | EKS cluster role and worker-node role, with the AWS-managed policies EKS requires (`AmazonEKSClusterPolicy`, `AmazonEKSWorkerNodePolicy`, `AmazonEC2ContainerRegistryReadOnly`, `AmazonEKS_CNI_Policy`) |
| **Security**     | Cluster and node security groups plus the rules for node↔cluster and node↔node traffic |
| **Compute**      | EKS cluster and a managed node group (configurable size, instance type, and capacity type) |

### Architecture

```
                        ┌─────────────────────────────────────────────┐
                        │                    VPC 10.0.0.0/16           │
                        │                                              │
   Internet ── IGW ─────┤  ┌────────────────┐    ┌────────────────┐    │
                        │  │ public-subnet-1│    │ public-subnet-2│    │
                        │  │  10.0.1.0/24   │    │  10.0.2.0/24   │    │
                        │  │  (AZ a)        │    │  (AZ b)        │    │
                        │  └───────┬────────┘    └────────────────┘    │
                        │          │ (optional NAT GW lives here)      │
                        │          ▼                                   │
                        │  ┌────────────────┐    ┌────────────────┐    │
                        │  │private-subnet-1│    │private-subnet-2│    │
                        │  │  10.0.3.0/24   │    │  10.0.4.0/24   │    │
                        │  │  (AZ a)        │    │  (AZ b)        │    │
                        │  │  EKS nodes     │    │  EKS nodes     │    │
                        │  └────────────────┘    └────────────────┘    │
                        └─────────────────────────────────────────────┘
```

Worker nodes run in the **private** subnets. The EKS control plane is attached
to all four subnets. Public subnets are tagged for internet-facing load
balancers (`kubernetes.io/role/elb`); private subnets for internal ones
(`kubernetes.io/role/internal-elb`).

## File layout

| File | Purpose |
|------|---------|
| `versions.tf`        | Terraform + provider version constraints |
| `backend.tf`         | State backend (local by default; S3 block prepared) |
| `provider.tf`        | AWS provider configuration |
| `variables.tf`       | Input variables with descriptions and validation |
| `terraform.tfvars`   | Concrete values for this environment |
| `locals.tf`          | `name_prefix` and `common_tags` |
| `data.tf`            | Data sources (availability zones) |
| `vpc.tf`             | VPC and Internet Gateway |
| `public_subnets.tf`  | Public subnets |
| `private_subnets.tf` | Private subnets |
| `route_tables.tf`    | Route tables, routes, associations |
| `nat.tf`             | Optional NAT Gateway + Elastic IP |
| `security_groups.tf` | Security groups and rules |
| `iam.tf`             | IAM roles and policy attachments |
| `eks.tf`             | EKS cluster |
| `node_groups.tf`     | EKS managed node group |
| `outputs.tf`         | Outputs |

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5.0
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) v2
- `kubectl` (to talk to the cluster after it is up)
- AWS credentials with permission to manage VPC, EKS, IAM, and EC2 resources

Configure credentials, e.g.:

```bash
aws configure
# or
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=ap-south-1
```

## Deploy

```bash
terraform init      # download the AWS provider, initialise the backend
terraform fmt       # (optional) canonical formatting
terraform validate  # sanity-check the configuration
terraform plan      # review what will be created
terraform apply     # create the infrastructure
```

Then point `kubectl` at the new cluster (the command is also printed as the
`configure_kubectl` output):

```bash
aws eks update-kubeconfig --region ap-south-1 --name streamdash-cluster
kubectl get nodes
```

## Destroy

```bash
terraform destroy
```

> A NAT Gateway and its Elastic IP bill by the hour. If you enabled it, running
> `terraform destroy` (or setting `enable_nat_gateway = false` and re-applying)
> stops those charges.

## Key configuration knobs

All variables live in `variables.tf`; set them in `terraform.tfvars`.

### NAT Gateway toggle

```hcl
enable_nat_gateway = false   # default — no outbound internet for private subnets (cheap)
enable_nat_gateway = true    # create NAT GW + EIP + private default route
```

When `false`, no NAT Gateway, Elastic IP, or private default route is created,
so there are no NAT charges. Set it to `true` when workloads in the private
subnets need outbound internet access. (A single NAT Gateway is used to keep
costs down; production HA would use one per AZ.)

### Node capacity type

```hcl
capacity_type = "ON_DEMAND"  # default — stable capacity
capacity_type = "SPOT"       # cheaper, interruptible
```

### Node group sizing

```hcl
instance_type = "t3.small"
desired_size  = 2
min_size      = 2
max_size      = 3
```

## Remote state (later)

`backend.tf` ships with the local backend active and an S3 backend block
commented out. To migrate:

1. Create an S3 bucket and a DynamoDB lock table (with a `LockID` primary key).
2. Uncomment the `backend "s3"` block in `backend.tf` and fill in the names.
3. Run `terraform init -migrate-state`.

## Notes

- No Terraform modules are used yet — the configuration is intentionally flat
  and explicit for readability.
- Every resource is tagged with `Project`, `ManagedBy`, and `Environment` via
  `local.common_tags`, plus a per-resource `Name`.
