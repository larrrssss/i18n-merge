import * as core from '@actions/core';

const inputs = {
  ROOT: '/',
  OUTPUT_FILE_PATH: 'output.json',
  LOCALES_FILE_PATH: 'locales.json',
  BASE_FILE_NAME: 'base.json',
  EXCLUDE: null,
};

const loadInputs = () =>
  Object.keys(inputs).reduce(
    (p, c) =>
      Object.assign(p, {
        [c]: core.getInput(c.toLowerCase()) || inputs[c as keyof typeof inputs],
      }),
    {} as Record<keyof typeof inputs, string>,
  );

export default loadInputs;
