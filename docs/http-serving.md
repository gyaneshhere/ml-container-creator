HTTP Servers are automatically deployed for predictive models. Predictive models deployed to Amazon SageMaker AI managed inference must support HTTP requests on `\ping` and `\invocations` on port 8080. The models themselves lack this capability, and most [LLM serving frameworks](llm-serving.md) suport this by default. For predictive models, this capability has to be built manually. To date, the following HTTP servers are supported:

--8<-- "web-server-table.md"

## Flask
!!! todo "Under Construction"
    This section of the documentation is under construction.

## FastAPI
!!! todo "Under Construction"
    This section of the documentation is under construction.