# SQS Queues for Async Processing
# Enables async evaluation flow: API Gateway -> SQS -> Lambda -> DynamoDB

# ============================================================================
# Writing Evaluation Queue
# ============================================================================

resource "aws_sqs_queue" "writing_evaluation" {
  name                       = "${local.name_prefix}-writing-evaluation"
  delay_seconds              = 0
  max_message_size           = 262144  # 256 KB
  message_retention_seconds  = 86400   # 1 day
  receive_wait_time_seconds  = 10      # Long polling
  visibility_timeout_seconds = 180     # 3x Lambda timeout (60s)

  # Dead letter queue for failed messages
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.writing_evaluation_dlq.arn
    maxReceiveCount     = 3
  })

  tags = merge(local.common_tags, {
    Name    = "${local.name_prefix}-writing-evaluation"
    Feature = "writing"
  })
}

resource "aws_sqs_queue" "writing_evaluation_dlq" {
  name                      = "${local.name_prefix}-writing-evaluation-dlq"
  message_retention_seconds = 1209600  # 14 days

  tags = merge(local.common_tags, {
    Name    = "${local.name_prefix}-writing-evaluation-dlq"
    Feature = "writing"
    Type    = "dead-letter-queue"
  })
}

# ============================================================================
# Speaking Evaluation Queue
# ============================================================================

resource "aws_sqs_queue" "speaking_evaluation" {
  name                       = "${local.name_prefix}-speaking-evaluation"
  delay_seconds              = 0
  max_message_size           = 262144  # 256 KB
  message_retention_seconds  = 86400   # 1 day
  receive_wait_time_seconds  = 10      # Long polling
  visibility_timeout_seconds = 360     # 3x Lambda timeout (120s)

  # Dead letter queue for failed messages
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.speaking_evaluation_dlq.arn
    maxReceiveCount     = 3
  })

  tags = merge(local.common_tags, {
    Name    = "${local.name_prefix}-speaking-evaluation"
    Feature = "speaking"
  })
}

resource "aws_sqs_queue" "speaking_evaluation_dlq" {
  name                      = "${local.name_prefix}-speaking-evaluation-dlq"
  message_retention_seconds = 1209600  # 14 days

  tags = merge(local.common_tags, {
    Name    = "${local.name_prefix}-speaking-evaluation-dlq"
    Feature = "speaking"
    Type    = "dead-letter-queue"
  })
}

# ============================================================================
# Flashcard Generation Queue
# ============================================================================

resource "aws_sqs_queue" "flashcard_generation" {
  name                       = "${local.name_prefix}-flashcard-generation"
  delay_seconds              = 0
  max_message_size           = 262144  # 256 KB
  message_retention_seconds  = 86400   # 1 day
  receive_wait_time_seconds  = 10      # Long polling
  visibility_timeout_seconds = 900     # 3x Lambda timeout (300s)

  # Dead letter queue for failed messages
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.flashcard_generation_dlq.arn
    maxReceiveCount     = 3
  })

  tags = merge(local.common_tags, {
    Name    = "${local.name_prefix}-flashcard-generation"
    Feature = "flashcard"
  })
}

resource "aws_sqs_queue" "flashcard_generation_dlq" {
  name                      = "${local.name_prefix}-flashcard-generation-dlq"
  message_retention_seconds = 1209600  # 14 days

  tags = merge(local.common_tags, {
    Name    = "${local.name_prefix}-flashcard-generation-dlq"
    Feature = "flashcard"
    Type    = "dead-letter-queue"
  })
}

# ============================================================================
# Lambda Event Source Mappings (SQS -> Lambda)
# ============================================================================

resource "aws_lambda_event_source_mapping" "writing_sqs" {
  event_source_arn                   = aws_sqs_queue.writing_evaluation.arn
  function_name                      = aws_lambda_function.writing_evaluator.arn
  batch_size                         = 1  # Process one at a time for AI calls
  maximum_batching_window_in_seconds = 0  # No batching delay

  scaling_config {
    maximum_concurrency = 5  # Limit concurrent executions
  }
}

resource "aws_lambda_event_source_mapping" "speaking_sqs" {
  event_source_arn                   = aws_sqs_queue.speaking_evaluation.arn
  function_name                      = aws_lambda_function.speaking_evaluator.arn
  batch_size                         = 1
  maximum_batching_window_in_seconds = 0

  scaling_config {
    maximum_concurrency = 5
  }
}

resource "aws_lambda_event_source_mapping" "flashcard_sqs" {
  event_source_arn                   = aws_sqs_queue.flashcard_generation.arn
  function_name                      = aws_lambda_function.rag_flashcard.arn
  batch_size                         = 1
  maximum_batching_window_in_seconds = 0

  scaling_config {
    maximum_concurrency = 3  # Lower for heavy PDF processing
  }
}
