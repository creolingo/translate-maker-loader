import isPlainObject from 'lodash/isPlainObject';

export default function normalizeLocale(obj) {
  if (!isPlainObject(obj)) {
    return obj;
  }

  const newObj = {};
  Object.keys(obj).forEach((propertyNameBase) => {
    const propertyValue = obj[propertyNameBase];

    // remove underscore prefix - default value in the translate maker
    const propertyName = propertyNameBase.indexOf('_') === 0
      ? propertyNameBase.substr(1)
      : propertyNameBase;

    const dotPos = propertyName.indexOf('.');
    if (dotPos !== -1) {
      const before = propertyName.substr(0, dotPos);
      const after = propertyName.substr(dotPos + 1);

      newObj[before] = normalizeLocale({
        [after]: propertyValue,
      });
      return;
    }

    newObj[propertyName] = normalizeLocale(propertyValue);
  });

  return newObj;
}
