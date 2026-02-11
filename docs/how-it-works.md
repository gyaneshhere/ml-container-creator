# How It Works

This guide describes how ML Container Creator (MCC) works. This document is a deeper guide meant for users interested in leveraging MCC for effectively. If you're just getting started, please check out the [Getting Started Guide](getting-started.md), or the [AWS OSS Launch Blog for ml-container-creator](https://aws.amazon.com/blogs/opensource/announcing-ml-container-creator-for-easy-byoc-on-sagemaker/) before proceeding. 

## Problem Statement
The explosion of models, architectures, and ways to serve AI models has made it harder to identify a path forward when deploying a model. Deploying a model can itself become challenging, as engineers copy/paste sample code that works here, but not there. The rationale for decisions made for or against a configuration option are difficult to propogate throughout an organization, necessitating a standardized mechanism for deploying models.

There will likely never be a shortage of models to use. However, as the AI/ML space coalesces around frameworks, techniques, and deployment options, it becomes easier for tooling to address the complexity of decisions that must be made in the course of deployment. 

## MCC Solution
MCC is built to assist customers in standardizing and simplifying the  technical assets associated with the three decisions made in the course of deploying a model:

1. Model Selection - Where does the model come from?
2. Model Serving - How will it serve inference requests?
3. Model Deployment - What infrastructure will this run on?

While these decisions seem independent, they become interrelated as you consider approaches to containerizing and customizing models. Moreover, each decision is an inflexion point that influences the technical assets used in deployment, such as Dockerfiles or start-up scripts for serving. 

MCC provides users with a standard interface for building and deploying these technical assets. This is accomplished using templated assets that accommodate a growing list of options. Actions can be taken using standardized scripts built in a manner reminiscent of the [do-framework](https://github.com/iankoulski/do-framework). 

MCC started as a [Yeoman Generator](https://yeoman.io/), allowing users to generate containerized deployment assets using a decision-tree style REPL. This is an easy way to understand the generation flow, though not the only way to interact with MCC. Users can automate the generation of these assets using a CLI configured by environment variables, CLI flags, and configuration files.

--8<-- "generator-flow-section.md"

## Architecture

The following diagram illustrates the complete flow from model selection through deployment.
!!! todo "Coming Soon"
    Features marked with an asterisk(*) are not currently supported, but are coming soon.

--8<-- "architecture-diagram.md"

#### Key Architectural Differences: Predictive ML vs Generative AI
MCC is built to deploy models to [Amazon SageMaker AI Managed Inference endpoints](https://aws.amazon.com/sagemaker/ai/deploy/). As such, MCC-built containers must support the two required HTTP endpoints for a SageMaker AI Managed Inference endpoint, `/ping` and `/invocations`, on port 8080 of the serving endpoint. To support predictive models built using regression or classification techniques, small models with thousands of parameters or less, are built and packed directly into the container and served with an HTTP server inside the container. These servers are configured to respond to HTTP requests on the required endpoints. Generative models are often too large to pull from Amazon S3 or to be loaded directly into the container from local disk. These large models are pulled from HuggingFace by a serving framework, which also handles HTTP requests. 

| Aspect | Predictive ML | Generative AI |
|--------|---------------|---------------|
| **Serving Architecture** | Separate layers: Model Handler (Python) + Web Server (Flask/FastAPI) + Nginx | Combined: model loading and HTTP serving is handled by the framework, with some NGINX proxy required by certain frameworks |
| **Model Storage** | Local files (.pkl, .h5) bundled in container, small size (MB). Amaozn S3* or SageMaker Model Registry* | HuggingFace Hub, downloaded at runtime, large size (GB) |
| **Instance Types** | CPU-optimized (ml.m5.x) | GPU-required (ml.g5.x) |
| **Inference** | Fast (milliseconds), batch-friendly, structured input/output | Slower (seconds), streaming responses, text generation |

### Incorporating a Model

Users must provide MCC a model to be deployed within the container assets. Failure to provide a model to MCC at generation time will result in unpredictable behavior which is dependent on the selected framework. 

MCC is built to support the containerization of specific model assets which are built using specific model training frameworks. Models are deployed directly into the container definition using Dockerfile directives. Alternatively, models can be pulled from model hubs using model serving frameworks. These two approaches are treated differentely by MCC. For more information, review the deep dives on [predictive](predictive-models.md) and [generative](generative-models.md) models.

### ML Hosting & Serving Frameworks
MCC supports several predictive ML and generative AI frameworks for model serving. This list is evolving, check Frameworks section for more details on how to use these for advanced use cases.

 Framework | Model Formats | Use Case |
|-----------|---------------|----------|
| scikit-learn | pkl, joblib | Prediction/ Classification | 
| XGBoost | json, model, ubj | Prediction/ Classification | 
| TensorFlow | keras, h5, SavedModel | Prediction/ Classification, Deep learning, neural networks |
| vLLM | LLM | Generation | 
| SGLang | LLM | Generation | 
| TensorRT-LLM | LLM | Generation | 
| LMI | LLM | Generation | 
| DJL | LLM | Generation | 

#### Supported Web Servers for Predictive Models
Predictive models trained using TensorFlow, Sci-Kit Learn, and other ML frameworks are not built to receive inference requests over HTTP. These frameworks require an additional web server to support inference and SageMaker AI health check requests over HTTP. 

| Web Server | Description |
|------------|----------------------|
| Flask |Lightweight Python web framework |
| FastAPI | Modern, fast API framework with automatic docs |

This is not a constraint for generative models, as the LLM serving frameworks supported by MCC feature built-in capabilities for handling HTTP requests.

### Container Building
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

### Endpoint Deployment
Once an MCC container is built, it can be launched as a process. 

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