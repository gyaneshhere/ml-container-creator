The core functionality of MCC is to build containers that can serve inference requests over HTTP. MCC uses Docker to build container files, packing in relevant code, configuration, and models in some cases, into the container object. Images are deployed to [Amazon Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/) for storage until they are ultimately deployed.

#### Local Building
Generated MCC projects are effectively just Dockerfiles with supporting code. These Dockerfiles can be built to create images and launched to a local container using docker commands. The Yeoman REPL facilitates the generation of a local image builder if the testing suite option is specified. This option generates a shell script which effectively performs the following steps:
1. Build the image locally using `docker` style commands
2. Deploy the container locally
3. Test the `/ping` endpoint to validate health-checks
4. Validate the `/invocations` endpoint to validate inference responses
    - This is designed to work for the Abalone sample model. Users are responsible for modifying these scripts for their own models.
!!! warning "`exec` errors"
    Locally built containers may result in `exec` errors if deployed onto different architectures. Users can experiment with the `--platform` flag for the `docker` binary, but for best results on Amazon SageMaker AI Managed Inference endpoints, users should opt to build with AWS CodeBuild.

#### AWS CodeBuild
[AWS CodeBuild](https://aws.amazon.com/codebuild/) is a managed service for building and testing code with automatic scaling. AWS CodeBuild can be used to build MCC containers remotely. Using AWS CodeBuild requires session credentials and an appropriately permissioned IAM role to submit a build. MCC automatically generates the appropriately scoped policy document and build specification necessary to build the container and store it to Amazon ECR. This is the preferred method for building MCC containers that can be deployed to an endpoint.