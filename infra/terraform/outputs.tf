output "vpc_id" {
  description = "VPC created for BookSwap."
  value       = aws_vpc.bookswap.id
}

output "instance_id" {
  description = "BookSwap EC2 instance."
  value       = aws_instance.bookswap.id
}

output "public_ip" {
  description = "Public IPv4 address of the BookSwap server."
  value       = aws_instance.bookswap.public_ip
}

output "application_url" {
  description = "Open after cloud-init finishes building the application containers."
  value       = "http://${aws_instance.bookswap.public_ip}"
}

output "health_url" {
  description = "API health endpoint through the nginx proxy."
  value       = "http://${aws_instance.bookswap.public_ip}/api/health"
}
