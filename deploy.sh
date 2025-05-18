#!/bin/bash

# Display deployment instructions
echo "=== Express Serverless API Deployment ==="
echo ""
echo "This script will deploy your Express.js serverless API to AWS."
echo ""
echo "Prerequisites:"
echo "1. AWS CLI installed and configured with appropriate credentials"
echo "2. Serverless Framework installed globally (npm install -g serverless)"
echo ""

# Check for AWS credentials
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "Warning: AWS credentials not found in environment variables."
  echo "Make sure your AWS credentials are properly configured in ~/.aws/credentials"
  echo "or set the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables."
  echo ""
fi

# Prompt for confirmation
read -p "Ready to deploy to AWS? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Deployment canceled."
    exit 1
fi

# Deploy using Serverless Framework
echo "Deploying to AWS..."
serverless deploy

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Your API is now live. You can test your endpoints with the following format:"
    echo "https://<api-id>.execute-api.<region>.amazonaws.com/<stage>/<resource>"
    echo ""
    echo "For example:"
    echo "https://<api-id>.execute-api.<region>.amazonaws.com/dev/users"
    echo ""
    echo "View your deployed resources in the AWS Console."
else
    echo ""
    echo "❌ Deployment failed. Check the error messages above."
fi