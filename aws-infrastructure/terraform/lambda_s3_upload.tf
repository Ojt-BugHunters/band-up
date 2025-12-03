# S3 Upload Lambda - Generates pre-signed URLs

resource "aws_lambda_function" "s3_upload" {
  filename         = "${path.module}/../lambda/build/s3-upload.zip"
  function_name    = "${local.name_prefix}-s3-upload"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 30
  memory_size      = 512

  source_code_hash = fileexists("${path.module}/../lambda/build/s3-upload.zip") ? filebase64sha256("${path.module}/../lambda/build/s3-upload.zip") : null

  environment {
    variables = {
      AUDIO_BUCKET     = aws_s3_bucket.audio.id
      DOCUMENTS_BUCKET = aws_s3_bucket.documents.id
      RESULTS_BUCKET   = aws_s3_bucket.results.id
      ENVIRONMENT      = var.environment
      URL_EXPIRATION   = "3600"
    }
  }

  tags = merge(local.common_tags, {
    Name    = "${local.name_prefix}-s3-upload"
    Feature = "upload"
  })
}

resource "aws_cloudwatch_log_group" "s3_upload" {
  name              = "/aws/lambda/${aws_lambda_function.s3_upload.function_name}"
  retention_in_days = 14
  tags              = local.common_tags
}

# Lambda permission for API Gateway is now in api_gateway.tf
