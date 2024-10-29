export default (inputFilenames) => {
  const filenames = inputFilenames.map((filename) => ({
    projectPath: filename.replace(`${import.meta.dirname}/`, ''),
    fullPath: filename,
  }));

  const commands = [`prettier --check ${inputFilenames.join(' ')}`];

  if (inputFilenames.some((filename) => /\.tsx?$/.test(filename))) {
    commands.push('tsc -p tsconfig.json --noEmit');
  }

  const srcFiles = filenames
    .filter((filename) => filename.projectPath.startsWith('src'))
    .map((filename) => filename.fullPath);

  if (srcFiles.length) {
    commands.push(`eslint --max-warnings 0 --no-warn-ignored ${srcFiles.join(' ')}`, 'vitest run');
  }

  return commands;
};
