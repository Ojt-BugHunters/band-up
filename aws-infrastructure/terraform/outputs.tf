# Outputs

output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = "${aws_api_gateway_stage.main.invoke_url}"
}

output "api_key" {
  description = "API Key for authentication (use in x-api-key header)"
  value       = aws_api_gateway_api_key.main.value
  sensitive   = true
}

output "api_key_id" {
  description = "API Key ID"
  value       = aws_api_gateway_api_key.main.id
}

output "usage_plan_id" {
  description = "Usage Plan ID"
  value       = aws_api_gateway_usage_plan.main.id
}

output "documents_bucket" {
  description = "S3 bucket for documents"
  value       = aws_s3_bucket.documents.id
}

output "documents_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.documents.arn
}

output "lambda_function_name" {
  description = "RAG Lambda function name"
  value       = aws_lambda_function.rag_flashcard.function_name
}

output "lambda_function_arn" {
  description = "RAG Lambda function ARN"
  value       = aws_lambda_function.rag_flashcard.arn
}

output "lambda_layer_arn" {
  description = "Core Lambda layer ARN"
  value       = aws_lambda_layer_version.core_layer.arn
}

output "gemini_secret_arn" {
  description = "Gemini API key secret ARN"
  value       = aws_secretsmanager_secret.gemini_api_key.arn
  sensitive   = true
}

output "cloudwatch_log_group" {
  description = "Lambda CloudWatch log group"
  value       = aws_cloudwatch_log_group.rag_flashcard.name
}

# API endpoints
output "flashcard_generate_endpoint" {
  description = "Flashcard generation endpoint"
  value       = "${aws_api_gateway_stage.main.invoke_url}/flashcards/generate"
}

output "writing_evaluate_endpoint" {
  description = "Writing evaluation endpoint"
  value       = "${aws_api_gateway_stage.main.invoke_url}/writing/evaluate"
}

output "writing_lambda_arn" {
  description = "Writing evaluator Lambda ARN"
  value       = aws_lambda_function.writing_evaluator.arn
}

output "speaking_evaluate_endpoint" {
  description = "Speaking evaluation endpoint"
  value       = "${aws_api_gateway_stage.main.invoke_url}/speaking/evaluate"
}

output "speaking_lambda_arn" {
  description = "Speaking evaluator Lambda ARN"
  value       = aws_lambda_function.speaking_evaluator.arn
}

# DynamoDB
output "evaluations_table" {
  description = "DynamoDB evaluations table"
  value       = aws_dynamodb_table.evaluations.name
}

output "flashcard_sets_table" {
  description = "DynamoDB flashcard sets table"
  value       = aws_dynamodb_table.flashcard_sets.name
}

# S3 Buckets
output "audio_bucket" {
  description = "S3 bucket for audio files"
  value       = aws_s3_bucket.audio.id
}

output "results_bucket" {
  description = "S3 bucket for results"
  value       = aws_s3_bucket.results.id
}

output "s3_upload_lambda_arn" {
  description = "S3 Upload Lambda ARN"
  value       = aws_lambda_function.s3_upload.arn
}

output "upload_audio_endpoint" {
  description = "Audio upload endpoint"
  value       = "${aws_api_gateway_stage.main.invoke_url}/upload/audio"
}

output "upload_document_endpoint" {
  description = "Document upload endpoint"
  value       = "${aws_api_gateway_stage.main.invoke_url}/upload/document"
}

# SQS Queues
output "writing_queue_url" {
  description = "Writing evaluation SQS queue URL"
  value       = aws_sqs_queue.writing_evaluation.url
}

output "speaking_queue_url" {
  description = "Speaking evaluation SQS queue URL"
  value       = aws_sqs_queue.speaking_evaluation.url
}

output "flashcard_queue_url" {
  description = "Flashcard generation SQS queue URL"
  value       = aws_sqs_queue.flashcard_generation.url
}

output "writing_queue_arn" {
  description = "Writing evaluation SQS queue ARN"
  value       = aws_sqs_queue.writing_evaluation.arn
}

output "speaking_queue_arn" {
  description = "Speaking evaluation SQS queue ARN"
  value       = aws_sqs_queue.speaking_evaluation.arn
}

output "flashcard_queue_arn" {
  description = "Flashcard generation SQS queue ARN"
  value       = aws_sqs_queue.flashcard_generation.arn
}

# Async endpoints
output "writing_evaluate_async_endpoint" {
  description = "Writing evaluation async endpoint (returns job_id)"
  value       = "${aws_api_gateway_stage.main.invoke_url}/writing/evaluate/async"
}

output "speaking_evaluate_async_endpoint" {
  description = "Speaking evaluation async endpoint (returns job_id)"
  value       = "${aws_api_gateway_stage.main.invoke_url}/speaking/evaluate/async"
}

output "flashcard_generate_async_endpoint" {
  description = "Flashcard generation async endpoint (returns job_id)"
  value       = "${aws_api_gateway_stage.main.invoke_url}/flashcards/generate/async"
}

output "evaluation_status_endpoint" {
  description = "Evaluation status endpoint (poll for results)"
  value       = "${aws_api_gateway_stage.main.invoke_url}/evaluations/{evaluation_id}/status"
}
