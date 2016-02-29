import isPlainObject from 'lodash/isPlainObject';

export default function objectToCode(obj, spaces = 2, level = 0) {
  if (!isPlainObject(obj)) {
    return obj;
  }

  const values = Object.keys(obj).map((key) => {
    const value = obj[key];
    return `${JSON.stringify(key)}: ${objectToCode(value, spaces, level + 1)}`;
  });

  return `{
    ${values.join(', \n')}
  }`;
}
