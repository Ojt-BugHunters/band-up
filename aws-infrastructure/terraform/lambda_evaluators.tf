# Lambda Functions for Writing and Speaking Evaluators
# Uses split layers from build-all.sh (each <50MB)

# ============================================================================
# Writing Evaluator Lambda
# ============================================================================

resource "aws_lambda_function" "writing_evaluator" {
  filename         = "${path.module}/../lambda/build/writing-evaluator.zip"
  function_name    = "${local.name_prefix}-writing-evaluator"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 60
  memory_size      = 512
  
  source_code_hash = fileexists("${path.module}/../lambda/build/writing-evaluator.zip") ? filebase64sha256("${path.module}/../lambda/build/writing-evaluator.zip") : null
  
  # Uses core + shared layers (defined in lambda.tf)
  layers = [
    aws_lambda_layer_version.core_layer.arn,
    aws_lambda_layer_version.shared_layer.arn
  ]
  
  environment {
    variables = {
      GEMINI_API_KEY_SECRET_ARN = aws_secretsmanager_secret.gemini_api_key.arn
      DYNAMODB_EVALUATIONS      = aws_dynamodb_table.evaluations.name
      ENVIRONMENT               = var.environment
    }
  }
  
  tags = merge(local.common_tags, {
    Name    = "${local.name_prefix}-writing-evaluator"
    Feature = "writing"
  })
}

resource "aws_cloudwatch_log_group" "writing_evaluator" {
  name              = "/aws/lambda/${aws_lambda_function.writing_evaluator.function_name}"
  retention_in_days = 14
  tags              = local.common_tags
}

# Lambda permission for API Gateway is now in api_gateway.tf

# ============================================================================
# Speaking Evaluator Lambda
# ============================================================================

resource "aws_lambda_function" "speaking_evaluator" {
  filename         = "${path.module}/../lambda/build/speaking-evaluator.zip"
  function_name    = "${local.name_prefix}-speaking-evaluator"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 120
  memory_size      = 1024
  
  source_code_hash = fileexists("${path.module}/../lambda/build/speaking-evaluator.zip") ? filebase64sha256("${path.module}/../lambda/build/speaking-evaluator.zip") : null
  
  # Uses core + shared layers (defined in lambda.tf)
  layers = [
    aws_lambda_layer_version.core_layer.arn,
    aws_lambda_layer_version.shared_layer.arn
  ]
  
  environment {
    variables = {
      GEMINI_API_KEY_SECRET_ARN = aws_secretsmanager_secret.gemini_api_key.arn
      DYNAMODB_EVALUATIONS      = aws_dynamodb_table.evaluations.name
      AUDIO_BUCKET              = aws_s3_bucket.audio.id
      ENVIRONMENT               = var.environment
    }
  }
  
  tags = merge(local.common_tags, {
    Name    = "${local.name_prefix}-speaking-evaluator"
    Feature = "speaking"
  })
}

resource "aws_cloudwatch_log_group" "speaking_evaluator" {
  name              = "/aws/lambda/${aws_lambda_function.speaking_evaluator.function_name}"
  retention_in_days = 14
  tags              = local.common_tags
}

# Lambda permission for API Gateway is now in api_gateway.tf


# ============================================================================
# Evaluation Status Lambda (for polling async results)
# ============================================================================

resource "aws_lambda_function" "evaluation_status" {
  filename         = "${path.module}/../lambda/build/evaluation-status.zip"
  function_name    = "${local.name_prefix}-evaluation-status"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 10
  memory_size      = 256
  
  source_code_hash = fileexists("${path.module}/../lambda/build/evaluation-status.zip") ? filebase64sha256("${path.module}/../lambda/build/evaluation-status.zip") : null
  
  environment {
    variables = {
      DYNAMODB_EVALUATIONS = aws_dynamodb_table.evaluations.name
      ENVIRONMENT          = var.environment
    }
  }
  
  tags = merge(local.common_tags, {
    Name    = "${local.name_prefix}-evaluation-status"
    Feature = "status"
  })
}

resource "aws_cloudwatch_log_group" "evaluation_status" {
  name              = "/aws/lambda/${aws_lambda_function.evaluation_status.function_name}"
  retention_in_days = 14
  tags              = local.common_tags
}
