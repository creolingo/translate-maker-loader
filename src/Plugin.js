export default class ExportLocales {
  constructor(options = {}) {
    this._options = options;

    this.apply = this.apply.bind(this);
    this.addExtractedLocale = this.addExtractedLocale.bind(this);
  }

  getOptions() {
    return this._options;
  }

  addExtractedLocale(locales, propertyName) {
    const options = this.getOptions();

    console.log(propertyName, locales);
  }

  apply(compiler) {
    compiler.plugin('this-compilation', (compilation) => {
      compilation.plugin('translate-maker-loader', (loaderContext) => {
        loaderContext.addExtractedLocale = this.addExtractedLocale;
      });
    });
  }
}
