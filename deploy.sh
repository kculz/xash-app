#!/bin/bash

# Build the project
npm run build

# Create .nojekyll file to bypass Jekyll processing
touch dist/.nojekyll

# Deploy to gh-pages branch
npx gh-pages -d dist