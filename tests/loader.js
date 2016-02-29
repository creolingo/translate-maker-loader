import should from 'should';
import loader, { ExtractLocales } from '../src';
import path from 'path';
import qs from 'qs';
import ResponseFormat from '../src/constants/ResponseFormat';

describe('Loader', () => {
  it('should be able to parse locales', (done) => {
    loader.call({
      query: '?' + qs.stringify({
        format: ResponseFormat.FUNCTION,
        localIdentName: '[name]_[hash:base64:7]',
        path: __dirname + '/output',
        defaultLocale: 'en_US',
        babel: {
          presets: ['es2015'],
        },
      }),
      addDependency: (file) => {
        console.log('Dependecy: ' + file);
      },
      resourcePath: path.resolve(__dirname + '/locale/locale'),
      async: () => function callback(err, result) {
        if (err) throw err;

        console.log(result);
        done();
      },
      emitWarning: (message) => console.log('WARNING: ' + message),
      emitError: (message) => console.log('ERROR: ' + message),
    });
  });
});
