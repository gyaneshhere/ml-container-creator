describe('Build/Deploy target separation', () => {
  it('accepts --build-target=local independently of --deploy-target', async () => {
    const result = await helpers
      .run(generatorPath)
      .withArguments(['test-project'])
      .withOptions({
        framework: 'sklearn',
        'model-server': 'flask',
        'model-format': 'pkl',
        'build-target': 'local',
        'deploy-target': 'sagemaker',
        'skip-prompts': true,
      });
    assert.equal(result.generator.props.buildTarget, 'local');
    assert.equal(result.generator.props.deployTarget, 'sagemaker');
  });

  it('accepts --build-target=codebuild independently of --deploy-target', async () => {
    const result = await helpers
      .run(generatorPath)
      .withArguments(['test-project'])
      .withOptions({
        framework: 'sklearn',
        'model-server': 'flask',
        'model-format': 'pkl',
        'build-target': 'codebuild',
        'deploy-target': 'sagemaker',
        'skip-prompts': true,
      });
    assert.equal(result.generator.props.buildTarget, 'codebuild');
    assert.equal(result.generator.props.deployTarget, 'sagemaker');
  });

  it('migrates legacy --deploy-target=codebuild to build-target=codebuild, deploy-target=sagemaker', async () => {
    const result = await helpers
      .run(generatorPath)
      .withArguments(['test-project'])
      .withOptions({
        framework: 'sklearn',
        'model-server': 'flask',
        'model-format': 'pkl',
        'deploy-target': 'codebuild',   // old style
        'skip-prompts': true,
      });
    assert.equal(result.generator.props.buildTarget, 'codebuild');    // migrated
    assert.equal(result.generator.props.deployTarget, 'sagemaker');   // corrected
  });
});
