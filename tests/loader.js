import should from 'should';
import loader, { ExtractLocales } from '../src';
import path from 'path';

describe('Loader', () => {
  it('should be able to parse locales', (done) => {
    loader.call({
      query: {
        localIdentName: '[name]_[hash:base64]',
        path: __dirname + '/output',
        babel: {
          presets: ['es2015'],
        },
      },
      addDependency: (file) => {
        console.log('Dependecy: ' + file);
      },
      resourcePath: path.resolve(__dirname + '/locale/locale'),
      async: () => function callback(err, result) {
        if (err) throw err;

        console.log(result);
        done();
      },
    });
  });
});
