import dropRightWhile from 'lodash/dropRightWhile';
import path from 'path';
import { interpolateName, stringifyRequest } from 'loader-utils';

const LOCALE_DIRNAME = 'locale';

function getPath(filepath) {
  const { dir } = path.parse(filepath);
  const parts = dir.split('/');

  return dropRightWhile(parts, (part) => part === LOCALE_DIRNAME).join('/');
}

export default function getLocalIdent(context, filepath, type) {
  // ext is required in the interpolateName
  const resourcePath = stringifyRequest(context, getPath(filepath) + '.js');

  return interpolateName({
    resourcePath,
  }, type, {
    content: filepath,
  });
}
