import dropRightWhile from 'lodash/dropRightWhile';
import path from 'path';
import { interpolateName } from 'loader-utils';

const LOCALE_DIRNAME = 'locale';

function getPath(filepath) {
  const { dir } = path.parse(filepath);
  const parts = dir.split('/');

  return dropRightWhile(parts, (part) => part === LOCALE_DIRNAME).join('/');
}

export default function getLocalIdent(filepath, type) {
  return interpolateName({
    resourcePath: getPath(filepath) + '.js', // ext is required in the interpolateName
  }, type, {
    content: filepath,
  });
}
