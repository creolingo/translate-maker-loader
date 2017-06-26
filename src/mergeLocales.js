import cloneDeep from 'lodash/cloneDeep';
import isPlainObject from 'lodash/isPlainObject';
import mergeWidth from './mergeWidth';

export default function mergeLocales(locales, emitter) {
  if (!locales.length) {
    return {};
  }

  const obj = cloneDeep(locales[0].data);
  for (let i = 1; i < locales.length; i += 1) {
    const localeBefore = locales[i - 1];
    const locale = locales[i];
    const currentLocale = cloneDeep(locale.data);

    mergeWidth(obj, currentLocale, (objValue, srcValue, path) => {
      // check defined
      const isObjDefined = typeof objValue !== 'undefined';
      const isSrcDefined = typeof srcValue !== 'undefined';
      const isObjPlainObject = isPlainObject(objValue);
      const isSrcPlainObject = isPlainObject(srcValue);

      if (!isObjDefined && isSrcDefined && !isSrcPlainObject) {
        emitter(`Path ${path} is not defined in: ${localeBefore.path}`);
      } else if (isObjDefined && !isSrcDefined && !isObjPlainObject) {
        emitter(`Path ${path} is not defined in: ${locale.path}`);
      }

      if ((isObjPlainObject || isSrcPlainObject) && isObjPlainObject !== isSrcPlainObject) {
        emitter(`Type of the path: ${path} is different check: ${localeBefore.path} and ${locale.path}`);
      }
    });
  }

  return obj;
}
