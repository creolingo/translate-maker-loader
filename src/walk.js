import fs from 'fs';
import { each } from 'async';

export default function walk(path2, fileCallback, callback) {
  fs.readdir(path2, (err, files) => {
    if (err) {
      return callback(err);
    }

    each(files, (file, cb) => {
      const newPath = path2 + '/' + file;
      fs.stat(newPath, (err2, stat) => {
        if (err2) {
          return cb(err2);
        }

        if (stat.isFile()) {
          if (/(.*)\.js$/.test(file)) {
            return fs.readFile(newPath, (err3, data) => {
              if (err3) {
                return cb(err3);
              }

              return fileCallback(data, newPath, cb);
            });
          }
        } else if (stat.isDirectory()) {
          return walk(newPath, fileCallback, cb);
        }

        cb();
      });
    }, callback);
  });
}
