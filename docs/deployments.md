MCC supports two deployment paths: direct SageMaker deployment and CodeBuild-based CI/CD. For direct deployment, the generated `deploy.sh` script creates a SageMaker model (referencing the ECR image), an endpoint configuration (specifying instance type and count), and finally the endpoint itself. The script waits for the endpoint to reach "InService" status before completing. For CI/CD workflows, MCC generates a `submit_build.sh` script that creates an AWS CodeBuild project, which handles building the Docker image, pushing to ECR, and deploying to SageMaker automatically on code changes. Both approaches provision the necessary AWS resources (IAM roles, ECR repositories, SageMaker endpoints) and configure them according to the framework and instance type selected during generation. Once deployed, the endpoint is accessible via the SageMaker Runtime API for real-time inference requests.


#### Local Deployment
Local endpoints can be deployed once the image has been built. Locak deployments are most easily accommodated by users who elect to build the container locally. Otherwise, users will have to download the container image from Amazon ECR to launch it locally. 

!!! warning "Local LLM Containers"
    Local deployment should be used sparingly. Predictive containers built on ML frameworks like XGBoost can easily be launched locally given their relatively small size and lack of GPU dependencies. This capability may not work for LLM-based serving frameworks. Images built from SGlang for example are quite large, and require GPU resources to be made available to your container. 

#### Amazon SageMaker AI Managed Inference
Amazon SageMaker AI Managed Inference is the preferred deployment target for MCC containers. MCC containers are built specifically for SageMaker endpoints, and users have the ability to select their preferred instance type, family and size when generating an MCC project. 

!!! info "Real-Time Only"
    At this time, real-time endpoints are the only supported Sagemaker AI managed inference endpoints supported by MCC.

#### Amazon SageMaker HyperPodd
!!! todo "Under Construction"
    This feature is roadmapped, but currently not supported.