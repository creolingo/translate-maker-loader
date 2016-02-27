export default class ExportLocales {
  constructor(options = {}) {
    this._options = options;

    this.apply = this.apply.bind(this);
  }

  getOptions() {
    return this._options;
  }

  apply(compiler) {
    const options = this.getOptions();

    compiler.plugin('this-compilation', (compilation) => {
      compilation.plugin('translate-maker-loader', (loaderContext, module) => {
        console.log(module);
      });
    });
  }
}
