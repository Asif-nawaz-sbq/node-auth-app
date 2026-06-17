#!/bin/bash

echo "Stopping Node app..."

pm2 stop node-auth-app || true
pm2 delete node-auth-app || true