import * as core from '@actions/core';
import path from 'path';
import fs from 'fs';

import loadInputs from './inputs';
import {
  filterPaths,
  getPathsRecursively,
  loadOutputFile,
  readPathOrThrow,
  reduceFilesToObject,
} from './utils';

(async () => {
  try {
    const { LOCALES_FILE_PATH, OUTPUT_FILE_PATH, ROOT } = loadInputs();
    const workspace = path.join(
      // Path from actions/checkout@v3
      core.getInput('workspace', {
        required: true,
      }),
      ROOT,
    );
    let changesDetected = false;

    // Read in locales array
    const locales: string[] = JSON.parse(
      await readPathOrThrow(path.join(workspace, LOCALES_FILE_PATH)),
    );

    // Validate locales array
    if (
      !Array.isArray(locales) ||
      locales.filter((l) => typeof l !== 'string').length
    )
      throw new Error(`${LOCALES_FILE_PATH} should be an array of strings`);

    for (const locale of locales) {
      core.info(`Merging ${locale}`);

      const paths = await getPathsRecursively(path.join(workspace, locale));
      const output = await reduceFilesToObject(
        filterPaths(paths, path.join(workspace, locale)),
        path.join(workspace, locale),
      );

      const lastOutput = await loadOutputFile(path.join(workspace, locale));

      // Check if there is a diff between the old output file and the new one
      if (!lastOutput || JSON.stringify(lastOutput) !== JSON.stringify(output))
        changesDetected = true;

      await fs.promises.writeFile(
        path.join(workspace, locale, OUTPUT_FILE_PATH),
        JSON.stringify(output, null, 2),
      );
    }

    core.info(`changes_detected: ${changesDetected ? '1' : '0'}`);
    core.setOutput('changes_detected', changesDetected ? '1' : '0');
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
})();
