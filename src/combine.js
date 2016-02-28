import merge from 'lodash/merge';
import transform from './transform';

export default function combine(locales, propertyName, options = {}) {
  const obj = {};
  const transformedDefaultLocale = options.defaultLocale && locales[options.defaultLocale]
    ? transform(locales[options.defaultLocale], propertyName, options)
    : null;

  Object.keys(locales).forEach((locale) => {
    const localeObj = locales[locale];
    const transformedObj = transform(localeObj, propertyName);

    if (transformedDefaultLocale) {
      merge(obj, transformedDefaultLocale, transformedObj);
    } else {
      merge(obj, transformedObj);
    }
  });

  return {
    [propertyName]: obj,
  };
}
