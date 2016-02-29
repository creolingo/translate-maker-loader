import loader from './loader';
import ExtractLocales, { Format } from './Plugin';
import ResponseFormat from './constants/ResponseFormat';

export { ExtractLocales, Format, ResponseFormat };
export default loader;

// commonjs
loader.ExtractLocales = ExtractLocales;
loader.Format = Format;
loader.ResponseFormat = ResponseFormat;

module.exports = loader;
