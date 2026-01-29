// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Prompt definitions organized by phase for better maintainability.
 * Each phase handles a specific aspect of project configuration.
 */

/**
 * Generate pseudo-randomized project name based on framework
 * @param {string} framework - The ML framework
 * @returns {string} Generated project name
 */
function generateProjectName(framework) {
    const adjectives = [
        'smart', 'fast', 'clever', 'bright', 'swift', 'agile', 'sharp', 'quick',
        'wise', 'keen', 'bold', 'sleek', 'neat', 'cool', 'fresh', 'prime'
    ];
    
    const frameworkNames = {
        'sklearn': ['sklearn', 'scikit', 'sk'],
        'xgboost': ['xgb', 'xgboost', 'boost'],
        'tensorflow': ['tf', 'tensorflow', 'tensor'],
        'transformers': ['llm', 'transformer', 'gpt', 'bert', 'ai']
    };
    
    const suffixes = [
        'model', 'predictor', 'classifier', 'engine', 'service', 'api',
        'container', 'deployment', 'inference', 'ml', 'ai', 'bot'
    ];
    
    // Get random elements
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const frameworkName = frameworkNames[framework] ? 
        frameworkNames[framework][Math.floor(Math.random() * frameworkNames[framework].length)] :
        'ml';
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${adjective}-${frameworkName}-${suffix}`;
}

/**
 * Phase 1: Core ML configuration (moved to first)
 */
const frameworkPrompts = [
    {
        type: 'list',
        name: 'framework',
        message: 'Which ML framework are you using?',
        choices: ['sklearn', 'xgboost', 'tensorflow', 'transformers']
    }
];

/**
 * Framework version selection prompts (for registry system)
 * Requirements: 2.1, 2.6, 8.2, 8.3
 */
const frameworkVersionPrompts = [
    {
        type: 'list',
        name: 'frameworkVersion',
        message: (answers) => `Which version of ${answers.framework} are you using?`,
        choices: (answers) => {
            // Choices will be populated by PromptRunner with registry data
            return answers._frameworkVersionChoices || [];
        },
        when: (answers) => {
            // Only show if we have version choices available
            return answers._frameworkVersionChoices && answers._frameworkVersionChoices.length > 0;
        }
    }
];

/**
 * Framework profile selection prompts (for registry system)
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.10
 */
const frameworkProfilePrompts = [
    {
        type: 'list',
        name: 'frameworkProfile',
        message: 'Select a framework configuration profile:',
        choices: (answers) => {
            // Choices will be populated by PromptRunner with registry data
            return answers._frameworkProfileChoices || [];
        },
        when: (answers) => {
            // Only show if we have profile choices available
            return answers._frameworkProfileChoices && answers._frameworkProfileChoices.length > 0;
        }
    }
];

const modelFormatPrompts = [
    {
        type: 'list',
        name: 'modelFormat',
        message: 'In which format is your model serialized?',
        choices: (answers) => {
            const formatMap = {
                'xgboost': ['json', 'model', 'ubj'],
                'sklearn': ['pkl', 'joblib'],
                'tensorflow': ['keras', 'h5', 'SavedModel']
            };
            return formatMap[answers.framework] || [];
        },
        when: answers => answers.framework !== 'transformers'
    },
    {
        type: 'list',
        name: 'modelName',
        message: 'Which model do you want to use?',
        choices: [
            'openai/gpt-oss-20b',
            'meta-llama/Llama-3.2-3B-Instruct',
            'meta-llama/Llama-3.2-1B-Instruct',
            'Custom (enter manually)'
        ],
        default: 'openai/gpt-oss-20b',
        when: answers => answers.framework === 'transformers'
    },
    {
        type: 'input',
        name: 'customModelName',
        message: 'Enter the Hugging Face model path:',
        validate: (input) => {
            if (!input || input.trim() === '') {
                return 'Model name is required for transformers';
            }
            // Basic validation for Hugging Face model format (org/model-name)
            if (!input.includes('/')) {
                return 'Please use the full Hugging Face model path (e.g., microsoft/DialoGPT-medium)';
            }
            return true;
        },
        when: answers => answers.framework === 'transformers' && answers.modelName === 'Custom (enter manually)'
    }
];

const modelServerPrompts = [
    {
        type: 'list',
        name: 'modelServer',
        message: 'Which model server are you serving with?',
        choices: (answers) => {
            if (answers.framework === 'transformers') {
                return ['vllm', 'sglang', 'tensorrt-llm', 'lmi', 'djl'];
            }
            return ['flask', 'fastapi'];
        }
    }
];

/**
 * Model profile selection prompts (for registry system)
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.10
 */
const modelProfilePrompts = [
    {
        type: 'list',
        name: 'modelProfile',
        message: 'Select a model configuration profile:',
        choices: (answers) => {
            // Choices will be populated by PromptRunner with registry data
            return answers._modelProfileChoices || [];
        },
        when: (answers) => {
            // Only show if we have profile choices available
            return answers._modelProfileChoices && answers._modelProfileChoices.length > 0;
        }
    }
];

/**
 * List of example model IDs that don't require HF_TOKEN prompts
 * These are public models that don't need authentication
 */
const EXAMPLE_MODEL_IDS = [
    'openai/gpt-oss-20b',
    'meta-llama/Llama-3.2-3B-Instruct',
    'meta-llama/Llama-3.2-1B-Instruct'
];

/**
 * HuggingFace token prompts for transformer models
 */
const hfTokenPrompts = [
    {
        type: 'input',
        name: 'hfToken',
        message: 'HuggingFace token (enter token, "$HF_TOKEN" for env var, or leave empty):',
        when: (answers) => {
            // Only prompt when:
            // 1. Framework is transformers
            // 2. User manually entered a model ID (not from examples)
            const isTransformers = answers.framework === 'transformers';
            
            // Check if user selected custom model entry
            const isManualEntry = answers.modelName === 'Custom (enter manually)';
            
            // If manual entry, we need to check the customModelName
            // If it matches an example model (case-insensitive), skip prompt
            if (isTransformers && isManualEntry && answers.customModelName) {
                const customModel = answers.customModelName.toLowerCase();
                const isExampleModel = EXAMPLE_MODEL_IDS.some(
                    exampleId => exampleId.toLowerCase() === customModel
                );
                
                if (isExampleModel) {
                    return false; // Skip prompt for example models
                }
                
                // Display security warning before prompting
                console.log('\n🔐 HuggingFace Authentication');
                console.log('⚠️  Security Note: The token will be baked into the Docker image.');
                console.log('   Anyone with access to the image can extract the token using \'docker inspect\'.');
                console.log('   For CI/CD pipelines, use "$HF_TOKEN" to reference an environment variable.');
                console.log('   This keeps the token out of the image and allows rotation without rebuilding.\n');
                
                return true; // Show prompt for custom models
            }
            
            return false; // Skip prompt for non-transformers or example models
        },
        validate: (input) => {
            // Empty is valid (not all models require auth)
            if (!input || input.trim() === '') {
                return true;
            }
            
            // $HF_TOKEN reference is valid
            if (input.trim() === '$HF_TOKEN') {
                return true;
            }
            
            // Direct token should start with hf_ (warning only, not blocking)
            if (!input.startsWith('hf_')) {
                console.warn('\n⚠️  Warning: HuggingFace tokens typically start with "hf_"');
                console.warn('   If this is intentional, you can ignore this warning.');
            }
            
            return true; // Always return true (non-blocking validation)
        }
    }
];

/**
 * Phase 2: Optional modules
 */
const modulePrompts = [
    {
        type: 'confirm',
        name: 'includeSampleModel',
        message: 'Include sample Abalone classifier?',
        default: false,
        when: (answers) => answers.framework !== 'transformers'
    },
    {
        type: 'confirm',
        name: 'includeTesting',
        message: 'Include test suite?',
        default: true
    },
    {
        type: 'checkbox',
        name: 'testTypes',
        message: 'Test type?',
        choices: (answers) => {
            if (answers.framework === 'transformers') {
                return ['hosted-model-endpoint'];
            }
            return ['local-model-cli', 'local-model-server', 'hosted-model-endpoint'];
        },
        when: answers => answers.includeTesting,
        default: (answers) => {
            if (answers.framework === 'transformers') {
                return ['hosted-model-endpoint'];
            }
            return ['local-model-cli', 'local-model-server', 'hosted-model-endpoint'];
        }
    }
];

/**
 * Phase 3: Infrastructure configuration
 */
const infrastructurePrompts = [
    {
        type: 'list',
        name: 'deployTarget',
        message: 'Deployment target?',
        choices: [
            { name: 'codebuild (recommended)', value: 'codebuild' },
            { name: 'sagemaker', value: 'sagemaker' }
        ],
        default: 'codebuild'
    },
    {
        type: 'list',
        name: 'codebuildComputeType',
        message: 'CodeBuild compute type?',
        choices: [
            'BUILD_GENERAL1_SMALL',
            'BUILD_GENERAL1_MEDIUM',
            'BUILD_GENERAL1_LARGE'
        ],
        default: 'BUILD_GENERAL1_MEDIUM',
        when: answers => answers.deployTarget === 'codebuild'
    },
    {
        type: 'list',
        name: 'instanceType',
        message: 'Instance type?',
        choices: (answers) => {
            if (answers.framework === 'transformers') {
                // TensorRT-LLM needs A10G GPUs (ml.g5) for better compatibility
                if (answers.modelServer === 'tensorrt-llm') {
                    return [
                        { name: 'GPU-optimized (ml.g5.12xlarge - recommended for TensorRT-LLM)', value: 'gpu-enabled' },
                        { name: 'Custom instance type', value: 'custom' }
                    ];
                }
                // vLLM and SGLang work well with newer L4 GPUs (ml.g6)
                return [
                    { name: 'GPU-optimized (ml.g6.12xlarge)', value: 'gpu-enabled' },
                    { name: 'Custom instance type', value: 'custom' }
                ];
            }
            return [
                { name: 'CPU-optimized (ml.m6g.large)', value: 'cpu-optimized' },
                { name: 'GPU-enabled (ml.g5.xlarge)', value: 'gpu-enabled' },
                { name: 'Custom instance type', value: 'custom' }
            ];
        },
        default: 'gpu-enabled'
    },
    {
        type: 'input',
        name: 'customInstanceType',
        message: 'Enter AWS SageMaker instance type (e.g., ml.t3.medium, ml.g4dn.xlarge):',
        validate: (input) => {
            if (!input || input.trim() === '') {
                return 'Instance type is required';
            }
            // Validate AWS SageMaker instance type format
            const instancePattern = /^ml\.[a-z0-9]+\.(nano|micro|small|medium|large|xlarge|[0-9]+xlarge)$/;
            if (!instancePattern.test(input.trim())) {
                return 'Invalid instance type format. Expected format: ml.{family}.{size} (e.g., ml.m5.large, ml.g4dn.xlarge)';
            }
            return true;
        },
        when: answers => answers.instanceType === 'custom'
    },
    {
        type: 'list',
        name: 'awsRegion',
        message: 'Target AWS region?',
        choices: ['us-east-1'],
        default: 'us-east-1'
    },
    {
        type: 'input',
        name: 'awsRoleArn',
        message: 'AWS IAM Role ARN for SageMaker execution (optional)?',
        validate: (input) => {
            if (!input || input.trim() === '') {
                return true; // Optional parameter
            }
            const arnPattern = /^arn:aws:iam::\d{12}:role\/[\w+=,.@-]+$/;
            if (!arnPattern.test(input)) {
                return 'Invalid ARN format. Expected: arn:aws:iam::123456789012:role/RoleName';
            }
            return true;
        }
    }
];

/**
 * Phase 4: Project information (moved to last)
 */
const projectPrompts = [
    {
        type: 'input',
        name: 'projectName',
        message: 'What is the Project Name?',
        default: (answers) => {
            return generateProjectName(answers.framework);
        }
    }
];

const destinationPrompts = [
    {
        type: 'input',
        name: 'destinationDir',
        message: 'Where will the output directory be?',
        default: (answers) => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            return `./${answers.projectName}-${timestamp}`;
        }
    }
];

export {
    frameworkPrompts,
    frameworkVersionPrompts,
    frameworkProfilePrompts,
    modelFormatPrompts,
    modelServerPrompts,
    modelProfilePrompts,
    hfTokenPrompts,
    modulePrompts,
    infrastructurePrompts,
    projectPrompts,
    destinationPrompts
};