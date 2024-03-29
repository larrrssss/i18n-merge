import fs from 'fs';
import path from 'path';
import deepmerge from 'deepmerge';
import globToRegExp from 'glob-to-regexp';
import * as core from '@actions/core';

import loadInputs from './inputs';

export const removeExtension = (n: string) =>
  n.split('.').slice(0, -1).join('.');

export const readPathOrThrow = async (p: string) => {
  try {
    const content = await fs.promises.readFile(p);

    return content.toString();
  } catch (e) {
    throw new Error(`${p} does not exist`);
  }
};

export const getPathsRecursively = async (
  p: string,
  root = true,
): Promise<string[]> => {
  const paths = [];
  const { OUTPUT_FILE_PATH } = loadInputs();

  try {
    const result = await fs.promises.readdir(p);

    for (const f of result) {
      if (root && f === OUTPUT_FILE_PATH.split('/').pop()) continue;

      if (['json'].includes(f.split('.').pop() ?? '')) {
        core.info(`Found file ${f}`);
        paths.push(path.join(p, f));
      } else {
        paths.push(...(await getPathsRecursively(path.join(p, f), false)));
      }
    }

    return paths;
  } catch (e) {
    return [];
  }
};

export const reduceFilesToObject = async (paths: string[], root: string) => {
  let output = {};
  const { BASE_FILE_NAME } = loadInputs();

  for (const filePath of paths) {
    const tree =
      filePath
        .split(root)
        .pop()
        ?.split('/')
        .filter((s) => s.length)
        .map((s) => s.split('.')[0]) ?? [];
    const content = JSON.parse(await readPathOrThrow(filePath));

    if (!tree.length) continue;

    if (tree.length === 1 && tree[0] === removeExtension(BASE_FILE_NAME)) {
      output = deepmerge(output, content);
      continue;
    }

    output = deepmerge(
      output,
      tree
        .slice(0, -1)
        .reverse()
        .reduce((p, c) => ({ [c]: p }), { [tree[tree.length - 1]]: content }),
    );
  }

  return output;
};

export const loadOutputFile = async (basePath: string): Promise<{} | null> => {
  const { OUTPUT_FILE_PATH } = loadInputs();
  const p = path.join(basePath, OUTPUT_FILE_PATH);
  let content = await readPathOrThrow(p).catch(() => null);

  if (!content) return null;

  try {
    content = JSON.parse(content);
  } catch (e) {
    core.setFailed(
      `${p} is malformed. Make sure your output file contains valid json`,
    );
    return null;
  }

  return content;
};

export const filterPaths = (paths: string[], prefix: string) => {
  const { EXCLUDE } = loadInputs();

  if (!EXCLUDE) return paths;

  const excludeRegex = globToRegExp(path.join(prefix, EXCLUDE), {
    globstar: true,
  });
  return paths.filter((p) => !excludeRegex.test(p));
};
