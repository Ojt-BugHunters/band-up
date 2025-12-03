# Variables for IELTS AI RAG Pipeline

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "ielts-ai"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# S3
variable "documents_bucket_name" {
  description = "S3 bucket for document uploads"
  type        = string
  default     = ""
}

# Lambda
variable "lambda_memory_size" {
  description = "Lambda memory size in MB"
  type        = number
  default     = 1024
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 60
}

# Gemini API
variable "gemini_api_key" {
  description = "Gemini API key"
  type        = string
  sensitive   = true
}

# RAG Configuration
variable "rag_chunk_size" {
  description = "RAG chunk size"
  type        = number
  default     = 500
}

variable "rag_chunk_overlap" {
  description = "RAG chunk overlap"
  type        = number
  default     = 100
}

variable "rag_top_k" {
  description = "Number of chunks to retrieve"
  type        = number
  default     = 5
}

# VPC (optional)
variable "enable_vpc" {
  description = "Enable VPC for Lambda"
  type        = bool
  default     = false
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["ap-southeast-1a", "ap-southeast-1b"]
}
