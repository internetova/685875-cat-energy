"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var del = require("del");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const gcmq = require("gulp-group-css-media-queries");
var csso = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var htmlmin = require("gulp-htmlmin");
var uglify = require("gulp-uglify");
var pump = require("pump");
var size = require("gulp-size");
var changed = require("gulp-changed");
var server = require("browser-sync").create();

gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(gcmq())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(size())
    .pipe(csso())
    .pipe(size())
    .pipe(rename("style.min.css"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(changed("build/img"))
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function () {
  return gulp.src("source/img/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("svgxuse", function () {
  return gulp.src("node_modules/svgxuse/svgxuse.min.js")
    .pipe(gulp.dest("build/js"));
});

gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(changed("build/img/*.webp"))
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("jsmin", function (cb) {
  pump([
  gulp.src("build/js/*.js")
    .pipe(size()),
      uglify(),
      rename({
        extname: ".min.js"
      })
        .pipe(size()),
      gulp.dest("build/js")
    ],
    cb
  );
});

gulp.task("delduble",function () {
  return del("build/js/*min.min.js");
})

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**"
    ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(gulp.dest("build"));
});

gulp.task("htmlmin", () => {
  return gulp.src("source/*.html")
    .pipe(size())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(size())
    .pipe(gulp.dest("build"));
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css", "refresh"));
  gulp.watch("source/img/*.{png,jpg,svg}", gulp.series("images", "refresh"));
  gulp.watch("source/img/*.{jpg,png}", gulp.series("webp", "refresh"));
  gulp.watch("source/img/*.svg", gulp.series("images", "sprite", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("build", gulp.series(
  "clean",
  "copy",
  "css",
  "images",
  "sprite",
  "svgxuse",
  "webp",
  "jsmin",
  "delduble",
  "html",
  "htmlmin"
));

gulp.task("start", gulp.series("build", "server"));
