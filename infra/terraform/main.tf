terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "ominx"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# VPC e Subnets
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
  
  name = "${var.project_name}-vpc"
  cidr = var.vpc_cidr
  
  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs
  
  enable_nat_gateway = true
  single_nat_gateway = true
  
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Environment = var.environment
  }
}

# Security Groups
resource "aws_security_group" "ec2_sg" {
  name_prefix = "${var.project_name}-ec2-sg"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }
  
  # Portas para as aplicações
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "API Gateway"
  }
  
  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Auth Service"
  }
  
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "User UI"
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.project_name}-ec2-sg"
  }
}

# EC2 Instance
resource "aws_instance" "ecommerce_server" {
  ami                    = var.ec2_ami
  instance_type          = var.ec2_instance_type
  key_name              = aws_key_pair.ecommerce_key.key_name
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  subnet_id              = module.vpc.public_subnets[0]
  
  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }
  
  user_data = templatefile("${path.module}/user-data.sh", {
    docker_compose_version = "v2.20.0"
  })
  
  # Garantir que a instância seja pública
  associate_public_ip_address = true
  
  tags = {
    Name = "${var.project_name}-server"
  }
}

# Key Pair
resource "aws_key_pair" "ecommerce_key" {
  key_name   = "${var.project_name}-key"
  public_key = file("${path.module}/ssh/public_ssh_key_aws")
}

# Elastic IP
resource "aws_eip" "ecommerce_eip" {
  instance = aws_instance.ecommerce_server.id
  domain   = "vpc"
  
  tags = {
    Name = "${var.project_name}-eip"
  }
}

# Outputs
output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.ecommerce_server.id
}

output "public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_eip.ecommerce_eip.public_ip
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
} 