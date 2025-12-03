# Lambda Functions for RAG Flashcard Generation

# ============================================================================
# Lambda Layers (split for <50MB limit)
# ============================================================================

# Core Layer: Gemini + Pydantic (~15MB)
resource "aws_lambda_layer_version" "core_layer" {
  filename            = "${path.module}/../lambda/build/core-layer.zip"
  layer_name          = "${local.name_prefix}-core"
  compatible_runtimes = ["python3.11", "python3.12"]
  description         = "Core: Gemini API, Pydantic, utilities"
  
  source_code_hash = fileexists("${path.module}/../lambda/build/core-layer.zip") ? filebase64sha256("${path.module}/../lambda/build/core-layer.zip") : null
}

# PDF Layer: PyPDF2 + PyMuPDF (~25MB)
resource "aws_lambda_layer_version" "pdf_layer" {
  filename            = "${path.module}/../lambda/build/pdf-layer.zip"
  layer_name          = "${local.name_prefix}-pdf"
  compatible_runtimes = ["python3.11", "python3.12"]
  description         = "PDF processing: PyPDF2, PyMuPDF"
  
  source_code_hash = fileexists("${path.module}/../lambda/build/pdf-layer.zip") ? filebase64sha256("${path.module}/../lambda/build/pdf-layer.zip") : null
}

# Shared Code Layer: lambda_shared + RAG modules (~1MB)
resource "aws_lambda_layer_version" "shared_layer" {
  filename            = "${path.module}/../lambda/build/shared-layer.zip"
  layer_name          = "${local.name_prefix}-shared"
  compatible_runtimes = ["python3.11", "python3.12"]
  description         = "Shared code: lambda_shared, RAG modules, helpers"
  
  source_code_hash = fileexists("${path.module}/../lambda/build/shared-layer.zip") ? filebase64sha256("${path.module}/../lambda/build/shared-layer.zip") : null
}

# RAG Flashcard Generator Lambda
resource "aws_lambda_function" "rag_flashcard" {
  filename         = "${path.module}/../lambda/build/rag-flashcard.zip"
  function_name    = "${local.name_prefix}-rag-flashcard"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 300  # 5 minutes for large PDFs
  memory_size      = var.lambda_memory_size
  
  source_code_hash = fileexists("${path.module}/../lambda/build/rag-flashcard.zip") ? filebase64sha256("${path.module}/../lambda/build/rag-flashcard.zip") : null
  
  layers = [
    aws_lambda_layer_version.core_layer.arn,
    aws_lambda_layer_version.pdf_layer.arn,
    aws_lambda_layer_version.shared_layer.arn
  ]
  
  environment {
    variables = {
      GEMINI_API_KEY_SECRET_ARN = aws_secretsmanager_secret.gemini_api_key.arn
      RAG_CHUNK_SIZE            = "2000"   # Larger chunks = fewer API calls
      RAG_CHUNK_OVERLAP         = "200"
      RAG_TOP_K                 = var.rag_top_k
      GEMINI_MODEL              = "gemini-2.0-flash"
      DOCUMENTS_BUCKET          = aws_s3_bucket.documents.id
      DYNAMODB_EVALUATIONS      = aws_dynamodb_table.evaluations.name
      ENVIRONMENT               = var.environment
    }
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-rag-flashcard"
  })
}

# Lambda permission for S3 to invoke
resource "aws_lambda_permission" "s3_invoke" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rag_flashcard.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.documents.arn
}

# Lambda permission for API Gateway is now in api_gateway.tf

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "rag_flashcard" {
  name              = "/aws/lambda/${aws_lambda_function.rag_flashcard.function_name}"
  retention_in_days = 14
  
  tags = local.common_tags
}
