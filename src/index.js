import loader from './loader';
import ExtractLocales from './Plugin';

export { ExtractLocales };
export default loader;

loader.ExtractLocales = ExtractLocales;
module.exports = loader;
