#!/bin/bash
# ============================================================
#  Hotel New Kishan - AWS EC2 Auto-Deployment Script
#  Run this on a fresh Ubuntu 22.04 EC2 instance
# ============================================================

set -e   # Exit on any error

echo "=============================================="
echo "  Hotel New Kishan - AWS EC2 Setup Script"
echo "  Owner: Mr. Kuldip Khairnar"
echo "=============================================="
sleep 2

# 1. Update system
echo "[1/7] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Install Docker
echo "[2/7] Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 3. Add current user to docker group (no sudo needed)
echo "[3/7] Configuring Docker permissions..."
sudo usermod -aG docker $USER

# 4. Install Git
echo "[4/7] Installing Git..."
sudo apt-get install -y git

# 5. Clone or pull the project (EDIT THE URL BELOW if you push to GitHub)
echo "[5/7] Setting up project files..."
if [ -d "hotel-new-kishan" ]; then
  cd hotel-new-kishan
  git pull origin main
else
  # If no git, create directory manually
  mkdir -p hotel-new-kishan
  cd hotel-new-kishan
  echo "NOTE: Please upload your project files to this directory."
fi

# 6. Start Docker services
echo "[6/7] Starting services with Docker Compose..."
sudo docker compose up -d --build

# 7. Seed the database
echo "[7/7] Seeding menu data..."
sleep 5  # Wait for mongodb to be ready
sudo docker compose exec backend node seed.js || echo "Seed can be run manually later"

echo ""
echo "==============================================="
echo "  Deployment Complete!"
echo "  Customer App : http://$(curl -s ifconfig.me)"
echo "  Owner Login  : http://$(curl -s ifconfig.me)/owner-login"
echo "==============================================="
