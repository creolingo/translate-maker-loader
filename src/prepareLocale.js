import get from 'lodash/get';
import isPlainObject from 'lodash/isPlainObject';
import ResponseFormat from './constants/ResponseFormat';

export default function prepareLocale(obj, prefix, format, defaultLocale, path) {
  if (!isPlainObject(obj)) {
    const pathWithPrefix = `${prefix}.${path}`;
    const defaultValue = defaultLocale ? get(defaultLocale, path) : undefined;

    if (format === ResponseFormat.OBJECT) {
      return {
        path: pathWithPrefix,
        defaultValue,
      };
    } else if (format === ResponseFormat.FUNCTION) {
      const defaultValueCode = defaultValue
        ? `defaultValue || ${JSON.stringify(defaultValue)}`
        : 'defaultValue';
      return `function (translateMaker, args, defaultValue) {
        return translateMaker.get(${JSON.stringify(pathWithPrefix)}, args, ${defaultValueCode});
      }`;
    }

    return pathWithPrefix;
  }

  const newObj = {};
  Object.keys(obj).forEach((propertyName) => {
    const newPath = path ? `${path}.${propertyName}` : propertyName;
    newObj[propertyName] = prepareLocale(obj[propertyName], prefix, format, defaultLocale, newPath);
  });

  return newObj;
}
