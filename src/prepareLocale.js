import ResponseFormat from './constants/ResponseFormat';
import get from 'lodash/get';
import isPlainObject from 'lodash/isPlainObject';

export default function prepareLocale(obj, prefix, format, defaultLocale, path) {
  if (!isPlainObject(obj)) {
    const pathWithPrefix = `${prefix}.${path}`;
    const defaultValue = defaultLocale ? get(defaultLocale, path) : void 0;

    if (format === ResponseFormat.OBJECT) {
      return {
        path: pathWithPrefix,
        defaultValue,
      };
    } else if (format === ResponseFormat.FUNCTION) {
      const defaultValueCode = defaultValue
        ? `defaultValue || ${JSON.stringify(defaultValue)}`
        : 'defaultValue';
      return `function (args, defaultValue) {
        var translateMaker = module.exports._translateMaker || require('translate-maker').getInstance();
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
