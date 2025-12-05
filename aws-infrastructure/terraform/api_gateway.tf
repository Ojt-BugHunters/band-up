# REST API Gateway with API Key Authentication and Usage Plans

# ============================================================================
# REST API (supports API keys, unlike HTTP API)
# ============================================================================

resource "aws_api_gateway_rest_api" "main" {
  name        = "${local.name_prefix}-api"
  description = "IELTS AI API with API key authentication"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = local.common_tags
}

# ============================================================================
# API Key and Usage Plan
# ============================================================================

resource "aws_api_gateway_api_key" "main" {
  name        = "${local.name_prefix}-api-key"
  description = "API key for IELTS AI services"
  enabled     = true

  tags = local.common_tags
}

resource "aws_api_gateway_usage_plan" "main" {
  name        = "${local.name_prefix}-usage-plan"
  description = "Usage plan with rate limiting"

  api_stages {
    api_id = aws_api_gateway_rest_api.main.id
    stage  = aws_api_gateway_stage.main.stage_name
  }

  # Rate limiting
  throttle_settings {
    burst_limit = 10   # Max concurrent requests
    rate_limit  = 5    # Requests per second
  }

  # Quota (requests per day/week/month)
  quota_settings {
    limit  = 1000      # Max requests
    period = "DAY"     # Per day
  }

  tags = local.common_tags
}

resource "aws_api_gateway_usage_plan_key" "main" {
  key_id        = aws_api_gateway_api_key.main.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.main.id
}

# ============================================================================
# Deployment and Stage
# ============================================================================

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode([
      # Sync endpoints
      aws_api_gateway_resource.flashcards.id,
      aws_api_gateway_resource.flashcards_generate.id,
      aws_api_gateway_method.flashcards_generate.id,
      aws_api_gateway_resource.writing.id,
      aws_api_gateway_resource.writing_evaluate.id,
      aws_api_gateway_method.writing_evaluate.id,
      aws_api_gateway_resource.speaking.id,
      aws_api_gateway_resource.speaking_evaluate.id,
      aws_api_gateway_method.speaking_evaluate.id,
      aws_api_gateway_resource.upload.id,
      aws_api_gateway_resource.upload_audio.id,
      aws_api_gateway_resource.upload_document.id,
      # Async endpoints (SQS)
      aws_api_gateway_resource.writing_evaluate_async.id,
      aws_api_gateway_method.writing_evaluate_async.id,
      aws_api_gateway_resource.speaking_evaluate_async.id,
      aws_api_gateway_method.speaking_evaluate_async.id,
      aws_api_gateway_resource.flashcards_generate_async.id,
      aws_api_gateway_method.flashcards_generate_async.id,
      # Status endpoint
      aws_api_gateway_resource.evaluations.id,
      aws_api_gateway_resource.evaluation_id.id,
      aws_api_gateway_resource.evaluation_status.id,
      aws_api_gateway_method.evaluation_status.id,
    ]))
  }

  # Ensure all integrations are created before deployment
  depends_on = [
    aws_api_gateway_integration.flashcards_generate,
    aws_api_gateway_integration.flashcards_generate_options,
    aws_api_gateway_integration.writing_evaluate,
    aws_api_gateway_integration.writing_evaluate_options,
    aws_api_gateway_integration.speaking_evaluate,
    aws_api_gateway_integration.speaking_evaluate_options,
    aws_api_gateway_integration.upload_audio,
    aws_api_gateway_integration.upload_audio_options,
    aws_api_gateway_integration.upload_document,
    aws_api_gateway_integration.upload_document_options,
    aws_api_gateway_integration.writing_evaluate_async,
    aws_api_gateway_integration.writing_evaluate_async_options,
    aws_api_gateway_integration.speaking_evaluate_async,
    aws_api_gateway_integration.speaking_evaluate_async_options,
    aws_api_gateway_integration.flashcards_generate_async,
    aws_api_gateway_integration.flashcards_generate_async_options,
    aws_api_gateway_integration.evaluation_status,
    aws_api_gateway_integration.evaluation_status_options,
  ]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = var.environment

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      responseLength = "$context.responseLength"
      apiKey         = "$context.identity.apiKey"
    })
  }

  depends_on = [aws_api_gateway_account.main]

  tags = local.common_tags
}

# ============================================================================
# CORS Configuration (Gateway Responses)
# ============================================================================

resource "aws_api_gateway_gateway_response" "cors_4xx" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  response_type = "DEFAULT_4XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Api-Key,Authorization'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
  }
}

resource "aws_api_gateway_gateway_response" "cors_5xx" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  response_type = "DEFAULT_5XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Api-Key,Authorization'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
  }
}

# ============================================================================
# /flashcards/generate
# ============================================================================

resource "aws_api_gateway_resource" "flashcards" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "flashcards"
}

resource "aws_api_gateway_resource" "flashcards_generate" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.flashcards.id
  path_part   = "generate"
}

resource "aws_api_gateway_method" "flashcards_generate" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.flashcards_generate.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_method" "flashcards_generate_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.flashcards_generate.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "flashcards_generate" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.flashcards_generate.id
  http_method             = aws_api_gateway_method.flashcards_generate.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.rag_flashcard.invoke_arn
}

resource "aws_api_gateway_integration" "flashcards_generate_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.flashcards_generate.id
  http_method = aws_api_gateway_method.flashcards_generate_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "flashcards_generate_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.flashcards_generate.id
  http_method = aws_api_gateway_method.flashcards_generate_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "flashcards_generate_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.flashcards_generate.id
  http_method = aws_api_gateway_method.flashcards_generate_options.http_method
  status_code = aws_api_gateway_method_response.flashcards_generate_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Api-Key,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# ============================================================================
# /writing/evaluate
# ============================================================================

resource "aws_api_gateway_resource" "writing" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "writing"
}

resource "aws_api_gateway_resource" "writing_evaluate" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.writing.id
  path_part   = "evaluate"
}

resource "aws_api_gateway_method" "writing_evaluate" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.writing_evaluate.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_method" "writing_evaluate_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.writing_evaluate.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "writing_evaluate" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.writing_evaluate.id
  http_method             = aws_api_gateway_method.writing_evaluate.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.writing_evaluator.invoke_arn
}

resource "aws_api_gateway_integration" "writing_evaluate_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.writing_evaluate.id
  http_method = aws_api_gateway_method.writing_evaluate_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "writing_evaluate_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.writing_evaluate.id
  http_method = aws_api_gateway_method.writing_evaluate_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "writing_evaluate_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.writing_evaluate.id
  http_method = aws_api_gateway_method.writing_evaluate_options.http_method
  status_code = aws_api_gateway_method_response.writing_evaluate_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Api-Key,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# ============================================================================
# /speaking/evaluate
# ============================================================================

resource "aws_api_gateway_resource" "speaking" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "speaking"
}

resource "aws_api_gateway_resource" "speaking_evaluate" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.speaking.id
  path_part   = "evaluate"
}

resource "aws_api_gateway_method" "speaking_evaluate" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.speaking_evaluate.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_method" "speaking_evaluate_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.speaking_evaluate.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "speaking_evaluate" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.speaking_evaluate.id
  http_method             = aws_api_gateway_method.speaking_evaluate.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.speaking_evaluator.invoke_arn
}

resource "aws_api_gateway_integration" "speaking_evaluate_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.speaking_evaluate.id
  http_method = aws_api_gateway_method.speaking_evaluate_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "speaking_evaluate_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.speaking_evaluate.id
  http_method = aws_api_gateway_method.speaking_evaluate_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "speaking_evaluate_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.speaking_evaluate.id
  http_method = aws_api_gateway_method.speaking_evaluate_options.http_method
  status_code = aws_api_gateway_method_response.speaking_evaluate_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Api-Key,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# ============================================================================
# /upload/audio and /upload/document
# ============================================================================

resource "aws_api_gateway_resource" "upload" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "upload"
}

resource "aws_api_gateway_resource" "upload_audio" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.upload.id
  path_part   = "audio"
}

resource "aws_api_gateway_resource" "upload_document" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.upload.id
  path_part   = "document"
}

resource "aws_api_gateway_method" "upload_audio" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.upload_audio.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_method" "upload_document" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.upload_document.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "upload_audio" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.upload_audio.id
  http_method             = aws_api_gateway_method.upload_audio.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.s3_upload.invoke_arn
}

resource "aws_api_gateway_integration" "upload_document" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.upload_document.id
  http_method             = aws_api_gateway_method.upload_document.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.s3_upload.invoke_arn
}

# OPTIONS for upload/audio CORS
resource "aws_api_gateway_method" "upload_audio_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.upload_audio.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "upload_audio_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.upload_audio.id
  http_method = aws_api_gateway_method.upload_audio_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "upload_audio_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.upload_audio.id
  http_method = aws_api_gateway_method.upload_audio_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "upload_audio_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.upload_audio.id
  http_method = aws_api_gateway_method.upload_audio_options.http_method
  status_code = aws_api_gateway_method_response.upload_audio_options.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Api-Key,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# OPTIONS for upload/document CORS
resource "aws_api_gateway_method" "upload_document_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.upload_document.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "upload_document_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.upload_document.id
  http_method = aws_api_gateway_method.upload_document_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "upload_document_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.upload_document.id
  http_method = aws_api_gateway_method.upload_document_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "upload_document_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.upload_document.id
  http_method = aws_api_gateway_method.upload_document_options.http_method
  status_code = aws_api_gateway_method_response.upload_document_options.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Api-Key,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# ============================================================================
# Lambda Permissions for REST API
# ============================================================================

resource "aws_lambda_permission" "api_gateway_flashcard" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rag_flashcard.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_gateway_writing" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.writing_evaluator.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_gateway_speaking" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.speaking_evaluator.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_gateway_s3_upload" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.s3_upload.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# ============================================================================
# CloudWatch Log Group
# ============================================================================

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${local.name_prefix}"
  retention_in_days = 14

  tags = local.common_tags
}

# ============================================================================
# IAM Role for API Gateway to SQS Integration
# ============================================================================

resource "aws_iam_role" "api_gateway_sqs" {
  name = "${local.name_prefix}-api-gateway-sqs"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "apigateway.amazonaws.com"
      }
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "api_gateway_sqs" {
  name = "${local.name_prefix}-api-gateway-sqs-policy"
  role = aws_iam_role.api_gateway_sqs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["sqs:SendMessage"]
        Resource = [
          aws_sqs_queue.writing_evaluation.arn,
          aws_sqs_queue.speaking_evaluation.arn,
          aws_sqs_queue.flashcard_generation.arn
        ]
      }
    ]
  })
}

# ============================================================================
# /writing/evaluate/async - Async Writing Evaluation
# ============================================================================

resource "aws_api_gateway_resource" "writing_evaluate_async" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.writing_evaluate.id
  path_part   = "async"
}

resource "aws_api_gateway_method" "writing_evaluate_async" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.writing_evaluate_async.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "writing_evaluate_async" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.writing_evaluate_async.id
  http_method             = aws_api_gateway_method.writing_evaluate_async.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = "arn:aws:apigateway:${var.aws_region}:sqs:path/${data.aws_caller_identity.current.account_id}/${aws_sqs_queue.writing_evaluation.name}"
  credentials             = aws_iam_role.api_gateway_sqs.arn

  request_parameters = {
    "integration.request.header.Content-Type" = "'application/x-www-form-urlencoded'"
  }

  request_templates = {
    "application/json" = <<EOF
Action=SendMessage&MessageBody=$util.urlEncode($input.body)&MessageAttribute.1.Name=RequestId&MessageAttribute.1.Value.StringValue=$context.requestId&MessageAttribute.1.Value.DataType=String
EOF
  }
}

resource "aws_api_gateway_method_response" "writing_evaluate_async" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.writing_evaluate_async.id
  http_method = aws_api_gateway_method.writing_evaluate_async.http_method
  status_code = "202"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "writing_evaluate_async" {
  rest_api_id       = aws_api_gateway_rest_api.main.id
  resource_id       = aws_api_gateway_resource.writing_evaluate_async.id
  http_method       = aws_api_gateway_method.writing_evaluate_async.http_method
  status_code       = aws_api_gateway_method_response.writing_evaluate_async.status_code
  selection_pattern = "^2[0-9][0-9]"  # Match 2xx responses from SQS

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  response_templates = {
    "application/json" = <<EOF
{
  "status": "accepted",
  "message": "Writing evaluation queued for processing",
  "job_id": "$context.requestId",
  "queue": "writing"
}
EOF
  }

  depends_on = [aws_api_gateway_integration.writing_evaluate_async]
}

# OPTIONS for CORS
resource "aws_api_gateway_method" "writing_evaluate_async_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.writing_evaluate_async.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "writing_evaluate_async_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.writing_evaluate_async.id
  http_method = aws_api_gateway_method.writing_evaluate_async_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "writing_evaluate_async_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.writing_evaluate_async.id
  http_method = aws_api_gateway_method.writing_evaluate_async_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "writing_evaluate_async_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.writing_evaluate_async.id
  http_method = aws_api_gateway_method.writing_evaluate_async_options.http_method
  status_code = aws_api_gateway_method_response.writing_evaluate_async_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Api-Key,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# ============================================================================
# /speaking/evaluate/async - Async Speaking Evaluation
# ============================================================================

resource "aws_api_gateway_resource" "speaking_evaluate_async" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.speaking_evaluate.id
  path_part   = "async"
}

resource "aws_api_gateway_method" "speaking_evaluate_async" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.speaking_evaluate_async.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "speaking_evaluate_async" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.speaking_evaluate_async.id
  http_method             = aws_api_gateway_method.speaking_evaluate_async.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = "arn:aws:apigateway:${var.aws_region}:sqs:path/${data.aws_caller_identity.current.account_id}/${aws_sqs_queue.speaking_evaluation.name}"
  credentials             = aws_iam_role.api_gateway_sqs.arn

  request_parameters = {
    "integration.request.header.Content-Type" = "'application/x-www-form-urlencoded'"
  }

  request_templates = {
    "application/json" = <<EOF
Action=SendMessage&MessageBody=$util.urlEncode($input.body)&MessageAttribute.1.Name=RequestId&MessageAttribute.1.Value.StringValue=$context.requestId&MessageAttribute.1.Value.DataType=String
EOF
  }
}

resource "aws_api_gateway_method_response" "speaking_evaluate_async" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.speaking_evaluate_async.id
  http_method = aws_api_gateway_method.speaking_evaluate_async.http_method
  status_code = "202"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "speaking_evaluate_async" {
  rest_api_id       = aws_api_gateway_rest_api.main.id
  resource_id       = aws_api_gateway_resource.speaking_evaluate_async.id
  http_method       = aws_api_gateway_method.speaking_evaluate_async.http_method
  status_code       = aws_api_gateway_method_response.speaking_evaluate_async.status_code
  selection_pattern = "^2[0-9][0-9]"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  response_templates = {
    "application/json" = <<EOF
{
  "status": "accepted",
  "message": "Speaking evaluation queued for processing",
  "job_id": "$context.requestId",
  "queue": "speaking"
}
EOF
  }

  depends_on = [aws_api_gateway_integration.speaking_evaluate_async]
}

# OPTIONS for CORS
resource "aws_api_gateway_method" "speaking_evaluate_async_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.speaking_evaluate_async.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "speaking_evaluate_async_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.speaking_evaluate_async.id
  http_method = aws_api_gateway_method.speaking_evaluate_async_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "speaking_evaluate_async_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.speaking_evaluate_async.id
  http_method = aws_api_gateway_method.speaking_evaluate_async_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "speaking_evaluate_async_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.speaking_evaluate_async.id
  http_method = aws_api_gateway_method.speaking_evaluate_async_options.http_method
  status_code = aws_api_gateway_method_response.speaking_evaluate_async_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Api-Key,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# ============================================================================
# /flashcards/generate/async - Async Flashcard Generation
# ============================================================================

resource "aws_api_gateway_resource" "flashcards_generate_async" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.flashcards_generate.id
  path_part   = "async"
}

resource "aws_api_gateway_method" "flashcards_generate_async" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.flashcards_generate_async.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "flashcards_generate_async" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.flashcards_generate_async.id
  http_method             = aws_api_gateway_method.flashcards_generate_async.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = "arn:aws:apigateway:${var.aws_region}:sqs:path/${data.aws_caller_identity.current.account_id}/${aws_sqs_queue.flashcard_generation.name}"
  credentials             = aws_iam_role.api_gateway_sqs.arn

  request_parameters = {
    "integration.request.header.Content-Type" = "'application/x-www-form-urlencoded'"
  }

  request_templates = {
    "application/json" = <<EOF
Action=SendMessage&MessageBody=$util.urlEncode($input.body)&MessageAttribute.1.Name=RequestId&MessageAttribute.1.Value.StringValue=$context.requestId&MessageAttribute.1.Value.DataType=String
EOF
  }
}

resource "aws_api_gateway_method_response" "flashcards_generate_async" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.flashcards_generate_async.id
  http_method = aws_api_gateway_method.flashcards_generate_async.http_method
  status_code = "202"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "flashcards_generate_async" {
  rest_api_id       = aws_api_gateway_rest_api.main.id
  resource_id       = aws_api_gateway_resource.flashcards_generate_async.id
  http_method       = aws_api_gateway_method.flashcards_generate_async.http_method
  status_code       = aws_api_gateway_method_response.flashcards_generate_async.status_code
  selection_pattern = "^2[0-9][0-9]"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  response_templates = {
    "application/json" = <<EOF
{
  "status": "accepted",
  "message": "Flashcard generation queued for processing",
  "job_id": "$context.requestId",
  "queue": "flashcard"
}
EOF
  }

  depends_on = [aws_api_gateway_integration.flashcards_generate_async]
}

# OPTIONS for CORS
resource "aws_api_gateway_method" "flashcards_generate_async_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.flashcards_generate_async.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "flashcards_generate_async_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.flashcards_generate_async.id
  http_method = aws_api_gateway_method.flashcards_generate_async_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "flashcards_generate_async_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.flashcards_generate_async.id
  http_method = aws_api_gateway_method.flashcards_generate_async_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "flashcards_generate_async_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.flashcards_generate_async.id
  http_method = aws_api_gateway_method.flashcards_generate_async_options.http_method
  status_code = aws_api_gateway_method_response.flashcards_generate_async_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Api-Key,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# ============================================================================
# /evaluations/{evaluation_id}/status - Poll for Results
# ============================================================================

resource "aws_api_gateway_resource" "evaluations" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "evaluations"
}

resource "aws_api_gateway_resource" "evaluation_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.evaluations.id
  path_part   = "{evaluation_id}"
}

resource "aws_api_gateway_resource" "evaluation_status" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.evaluation_id.id
  path_part   = "status"
}

resource "aws_api_gateway_method" "evaluation_status" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.evaluation_status.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true

  request_parameters = {
    "method.request.path.evaluation_id" = true
  }
}

resource "aws_api_gateway_integration" "evaluation_status" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.evaluation_status.id
  http_method             = aws_api_gateway_method.evaluation_status.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.evaluation_status.invoke_arn
}

# OPTIONS for CORS
resource "aws_api_gateway_method" "evaluation_status_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.evaluation_status.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "evaluation_status_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.evaluation_status.id
  http_method = aws_api_gateway_method.evaluation_status_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "evaluation_status_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.evaluation_status.id
  http_method = aws_api_gateway_method.evaluation_status_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "evaluation_status_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.evaluation_status.id
  http_method = aws_api_gateway_method.evaluation_status_options.http_method
  status_code = aws_api_gateway_method_response.evaluation_status_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Api-Key,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

resource "aws_lambda_permission" "api_gateway_evaluation_status" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.evaluation_status.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Note: data "aws_caller_identity" "current" is defined in main.tf
