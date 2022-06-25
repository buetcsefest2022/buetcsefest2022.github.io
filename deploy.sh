#!/usr/bin/bash

hugo
echo ""
echo "HUGO site built"
echo ""

git add .
echo "CHANGES added"
git commit -m "$1"
echo "CHANGES committed"
git push
echo "COMMIT pushed"
echo "***"


