###############################################
# Data Sources
###############################################

# Discover the Availability Zones that are usable in the selected region.
# Subnets index into this list ([0] and [1]) so the config stays portable
# across regions without hardcoding AZ names.
data "aws_availability_zones" "available" {
  state = "available"
}
