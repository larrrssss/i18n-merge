import * as core from '@actions/core';

const inputs = {
  ROOT: '/',
  OUTPUT_FILE_NAME: 'output.json',
  // Relative based on a locale folder
  OUTPUT_FILE_PATH: '/',
  LOCALES_FILE_NAME: 'locales.json',
  LOCALES_FILE_PATH: '/',
  BASE_FILE_NAME: 'base.json',
};

const loadInputs = () =>
  Object.keys(inputs).reduce(
    (p, c) =>
      Object.assign(p, {
        [c]: core.getInput(c) || inputs[c as keyof typeof inputs],
      }),
    {} as Record<keyof typeof inputs, string>,
  );

export default loadInputs;
