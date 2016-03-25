import dropRightWhile from 'lodash/dropRightWhile';
import path from 'path';
import { interpolateName } from 'loader-utils';

const LOCALE_DIRNAME = 'locale';

function getPath(filepath) {
  const { dir } = path.parse(filepath);
  const parts = dir.split('/');

  return dropRightWhile(parts, (part) => part === LOCALE_DIRNAME).join('/');
}

export default function getLocalIdent(loaderContext, filepath, type) {
  // ext is required in the interpolateName
  const context = loaderContext.options && typeof loaderContext.options.context === 'string'
    ? loaderContext.options.context
    : loaderContext.context;

  const filePathJS = getPath(filepath) + '.js';
  const resourcePath = path.relative(typeof context !== 'undefined' ? context : '.', filePathJS);

  return interpolateName({
    resourcePath,
  }, type, {
    content: resourcePath,
  });
}
