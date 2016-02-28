import isPlainObject from 'lodash/isPlainObject';

export default function transform(obj, path, options = {}) {
  if (!isPlainObject(obj)) {
    return path;
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
      const newPath = path ? `${path}.${before}` : before;

      newObj[before] = transform({
        [after]: propertyValue,
      }, newPath, options);
      return;
    }

    const newPath = path ? `${path}.${propertyName}` : propertyName;
    newObj[propertyName] = transform(propertyValue, newPath, options);

    if (options.defaultValue && options.defaultValuePropertyName && !isPlainObject(propertyValue)) {
      const propertyNameDefaultValue = options.defaultValuePropertyName.replace('[name]', propertyName);
      newObj[propertyNameDefaultValue] = propertyValue;
    }
  });

  return newObj;
}
