| Web Server | Compatible Frameworks | Description | Endpoints |
|------------|----------------------|-------------|-----------|
| Flask | scikit-learn, XGBoost, TensorFlow | Lightweight Python web framework | GET /ping, POST /invocations |
| FastAPI | scikit-learn, XGBoost, TensorFlow | Modern, fast API framework with automatic docs | GET /ping, POST /invocations |
| Nginx | scikit-learn, XGBoost, TensorFlow | Reverse proxy (sits in front of Flask/FastAPI) | Forwards to application server |
| vLLM | Transformers | Integrated serving (model + HTTP in one) | GET /ping, POST /invocations |
| SGLang | Transformers | Integrated serving (model + HTTP in one) | GET /ping, POST /invocations |
| TensorRT-LLM | Transformers | Integrated serving (model + HTTP in one) | GET /ping, POST /invocations |
| LMI | Transformers | Integrated serving (model + HTTP in one) | GET /ping, POST /invocations |
| DJL | Transformers | Integrated serving (model + HTTP in one) | GET /ping, POST /invocations |
