#!/bin/bash
set -e

echo "Verifying application status..."
# Example validation step
STATUS_CODE=200

if [ $STATUS_CODE -eq 200 ]; then
  echo "::notice::Health check passed successfully!"
  exit 0
else
  echo "::error::Health check failed with status code $STATUS_CODE"
  exit 1
fi