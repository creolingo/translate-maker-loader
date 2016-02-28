import gulp from 'gulp';
import babel from 'gulp-babel';
import istanbul from 'gulp-istanbul';
import coveralls from 'gulp-coveralls';
import path from 'path';
import { Instrumenter } from 'isparta';
import mocha from 'gulp-mocha';

gulp.task('pre-test', () => {
  return gulp.src(['src/**/*.js', '!src/parser/**'])
    .pipe(istanbul({
      dir: './coverage',
      instrumenter: Instrumenter,
      includeUntested: true,
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], () => {
  return gulp.src('./tests/**/*.js')
    .pipe(babel())
    .pipe(mocha({
      timeout: 20000,
      reporter: 'spec',
    }))
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global: {
          functions: 80,
        },
      },
    }));
});

gulp.task('build', () => {
  return gulp.src('./src/**/*.{js,jsx}')
    .pipe(babel())
    .pipe(gulp.dest('./dist'));
});

gulp.task('coveralls', ['test'], () => {
  if (!process.env.CI) {
    return void 0;
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls());
});

gulp.doneCallback = (err) => {
  process.exit(err ? 1 : 0);
};
