import loader from './loader';
import ExtractLocales, { Format } from './Plugin';

export { ExtractLocales, Format };
export default loader;

// commonjs
loader.ExtractLocales = ExtractLocales;
loader.Format = Format;
module.exports = loader;
