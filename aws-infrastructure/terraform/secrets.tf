# Secrets Manager for API Keys

resource "aws_secretsmanager_secret" "gemini_api_key" {
  name        = "${local.name_prefix}/gemini-api-key"
  description = "Gemini API key for RAG flashcard generation"
  
  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "gemini_api_key" {
  secret_id     = aws_secretsmanager_secret.gemini_api_key.id
  secret_string = var.gemini_api_key
}
