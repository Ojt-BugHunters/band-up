#!/bin/sh

set -e

echo "Downloading private key from S3..."
aws s3 cp s3://bandup2025-fcj/private_key.pem /app/private_key.pem

chmod 600 /app/private_key.pem
echo "Private key loaded."

# Continue with app startup
exec "$@"
