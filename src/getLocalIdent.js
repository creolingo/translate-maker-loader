import dropRightWhile from 'lodash/dropRightWhile';
import path from 'path';

const LOCALE_DIRNAME = 'locale';

function getName(filepath) {
  const { dir } = path.parse(filepath);
  const parts = dir.split('/');

  return dropRightWhile(parts, (part) => part === LOCALE_DIRNAME).pop();
}

export default function getLocalIdent(filepath, type) {
  const name = getName(filepath);
  const base64 = new Buffer(name).toString('base64').substr(0, 7);

  return type
    .replace('[name]', name)
    .replace('[hash:base64]', base64);
}
