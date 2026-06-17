#!/bin/bash
pm2 stop node-auth-app || true
pm2 delete node-auth-app || true