provider "aws" {
  region = "us-gov-west-1" # Enforces federal GovCloud deployment
}

variable "bucket_suffixes" {
  type = list(string)
  default = [
    "voice-telemetry-gov",
    "voice-spatial-gov",
    "voice-agri-gov",
    "voice-infra-gov",
    "voice-resilience-gov",
    "voice-metadata-gov",
    "voice-security-audit-gov"
  ]
}

# Automatically creates all 7 buckets with corporate & federal baseline standards
resource "aws_s3_bucket" "mission_phoenix_buckets" {
  count  = length(var.bucket_suffixes)
  bucket = "mission-phoenix-${var.bucket_suffixes[count.index]}"

  tags = {
    Project       = "mission-phoenix"
    FundingSource = "federal"
    Automation    = "bootstrapped"
  }
}

# Enforces Object Versioning across all 7 buckets to prevent data loss
resource "aws_s3_bucket_versioning" "versioning" {
  count  = length(var.bucket_suffixes)
  bucket = aws_s3_bucket.mission_phoenix_buckets[count.index].id
  versioning_configuration {
    status = "Enabled"
  }
}

# Enforces Private Access Control (No public data exposure)
resource "aws_s3_bucket_public_access_block" "private_lock" {
  count  = length(var.bucket_suffixes)
  bucket = aws_s3_bucket.mission_phoenix_buckets[count.index].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
