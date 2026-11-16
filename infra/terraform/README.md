# BookSwap on AWS

Run from this directory: `terraform init`, `terraform validate`,
`terraform plan`, then `terraform apply` after reviewing the plan.
AWS credentials come from the usual AWS CLI profile or environment;
never put them in Terraform files.

The configuration creates seven resources in an isolated VPC and launches
Amazon Linux 2023. At boot, it installs Docker/Compose, clones the public
GitHub repository at `repository_ref` (branch or tag), generates a PostgreSQL
password on the server and starts `compose.production.yaml` using systemd.
Publish the application files to that branch/tag before applying.

Only HTTP port 80 is exposed. This is a lab environment with HTTP, one EC2
instance and a local Docker volume, not a highly available production service.
The database password is generated at boot and stays on the server, outside
Terraform state. The default t3.micro uses swap during container builds.

Use `terraform.tfvars.example` as a reference for optional overrides.
After apply, allow several minutes for cloud-init and container builds, then
open `application_url` and `health_url`. Terraform's successful apply reports
EC2 creation; application readiness requires the HTTP checks as well.

The public repository must contain the current backend/frontend Dockerfiles
and `compose.production.yaml`. Changing the repository branch contents alone
does not trigger replacement; change `repository_ref` to a new published tag
when deploying a new version.

CI runs fmt/init/validate without AWS credentials. AWS plan/apply are manual.
Keep `.terraform.lock.hcl` in Git; keep `.terraform/`, state and tfvars out of Git.
Use `terraform destroy` from this directory when finished. This also removes
the EC2 disk and this lab's PostgreSQL data; retain state until destroy completes.

Ukrainian report text, commands and screenshot checklist:
`../../docs/individual-stage4.md`.
