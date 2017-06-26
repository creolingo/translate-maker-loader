import ResponseFormat from './constants/ResponseFormat';
import objectToCode from './objectToCode';

export default function result(value, format = ResponseFormat.PATH) {
  if (format === ResponseFormat.PATH || format === ResponseFormat.OBJECT) {
    const jsonContent = JSON.stringify(value, undefined, 2);
    return `module.exports = ${jsonContent};`;
  } else if (format === ResponseFormat.FUNCTION) {
    const content = objectToCode(value);
    return `module.exports = ${content};`;
  }

  return '';
}
