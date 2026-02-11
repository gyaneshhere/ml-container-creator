For the purposes of ML Container Creator, the term "predictive" model refers to small models that specialize in classification, regression, and basic NLP tasks. These models are likely trained in a matter of minutes or seconds, and are likely thousands of parameters or smaller. In other words, these are classic machine learning (ML) models. When using MCC to package and deploy a predictive model, the following frameworks are currently supported:

--8<-- "ml-frameworks-table.md"

MCC requires users to select a model format. Different ML frameworks save models in different formats, and these formats must be specified for the model loader to find the correct model files when they are loaded on the container.

## Loading Models
Model files are loaded into containers through various means. Users select from several model loading strategies. The selected option influences how files assets like the Dockerfile are generated. Ultimately, generated files can be modified and extended extensively by users to accommodate any model loading pattern that a user wants to implement. 

### Local Copy
Local copy mode takes a model file from your local file system and uses the `COPY` directive to load it into the `/opt/ml/model/` directory within the container. This happens at image build time, and the docker process that is building the image must have access to the file at build time. When bringing your own model using Local Copy mode, you must uncomment and modify the following line in the Dockerfile:
```
# COPY your_model_files /opt/ml/model/
```
!!! note "Note"
    Copying models to a different directory other than /opt/ml/model/ may result in deployment issues on Amazon SageMaker AI managed inference. You may need to consult documentation if you change the target directory.

#### Sample Model Option
The `Sample Model` option is available to users generating a predictive ML container using Local Copy mode. The sample model option trains a sample model on the [Abalone dataset](https://archive.ics.uci.edu/dataset/1/abalone) using the selected ML framework. The sample model is automatically loaded into the container using a similar `COPY` directive as shown above. 
!!! note "Note"
    Use the Sample Model option to test a container build or deployment process. This is for rapid start-up, and is not meant to be used for a production use case. This is to test model deployment functionality in the absence of a predictive model.

### Amazon S3
!!! todo "Under Construction"
    This feature is roadmapped, but currently not supported.

### Amazon SageMaker Model Registry
!!! todo "Under Construction"
    This feature is roadmapped, but currently not supported.

