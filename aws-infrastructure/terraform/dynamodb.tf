# DynamoDB Tables for Evaluations

resource "aws_dynamodb_table" "evaluations" {
  name           = "${local.name_prefix}-evaluations"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "evaluation_id"
  range_key      = "user_id"
  
  attribute {
    name = "evaluation_id"
    type = "S"
  }
  
  attribute {
    name = "user_id"
    type = "S"
  }
  
  attribute {
    name = "evaluation_type"
    type = "S"
  }
  
  attribute {
    name = "created_at"
    type = "N"
  }
  
  # GSI for querying by user
  global_secondary_index {
    name            = "user-evaluations-index"
    hash_key        = "user_id"
    range_key       = "created_at"
    projection_type = "ALL"
  }
  
  # GSI for querying by type
  global_secondary_index {
    name            = "type-index"
    hash_key        = "evaluation_type"
    range_key       = "created_at"
    projection_type = "ALL"
  }
  
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
  
  point_in_time_recovery {
    enabled = var.environment == "prod"
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-evaluations"
  })
}

# Flashcard sets table
resource "aws_dynamodb_table" "flashcard_sets" {
  name           = "${local.name_prefix}-flashcard-sets"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "set_id"
  range_key      = "user_id"
  
  attribute {
    name = "set_id"
    type = "S"
  }
  
  attribute {
    name = "user_id"
    type = "S"
  }
  
  attribute {
    name = "created_at"
    type = "N"
  }
  
  global_secondary_index {
    name            = "user-sets-index"
    hash_key        = "user_id"
    range_key       = "created_at"
    projection_type = "ALL"
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-flashcard-sets"
  })
}
