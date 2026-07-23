#!/bin/bash

app_env=${1:-development}

# 应用入口文件（生产环境只负责启动，不在这里做构建）
build_target="server"

# 开发环境
dev_commands() {
    echo "Running development environment commands..."
    NODE_ENV=development node "${build_target}.js"
}

# 生产环境（Release / Deploy 时使用）
prod_commands() {
    echo "Running production environment commands..."
    NODE_ENV=production node "${build_target}.js"
}

if [ "$app_env" = "production" ] || [ "$app_env" = "prod" ]; then
    echo "Production environment detected"
    prod_commands
else
    echo "Development environment detected"
    dev_commands
fi
