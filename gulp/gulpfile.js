var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    browserSync  = require('browser-sync'),
	del          = require('del'),
    uglify       = require('gulp-uglifyjs'), 
    cssnano      = require('gulp-cssnano'),
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
    cache        = require('gulp-cache'),
    concat       = require('gulp-concat'),
    sitemap      = require('gulp-sitemap'),
    robots       = require('gulp-robots'),
    autoprefixer = require('gulp-autoprefixer');



// Главный таск. Работа с файлами, библиотеками, препроцессорами. Вызывается через команду "gulp".

gulp.task('scss', function(){
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass({
            includePaths: [
                require('bourbon').includePaths, 
                require('node-normalize-scss').includePaths,
                require('bourbon-neat').includePaths
            ]
        }))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('scripts', function(){
	return gulp.src('app/libs/**/*.js') 
        .pipe(concat('libs.js'))
        .pipe(browserSync.reload({stream: true}))
		.pipe(gulp.dest('app/js'));
});

gulp.task('style', function(){
	return gulp.src('app/libs/**/*.css') 
        .pipe(concat('libs.css'))
        .pipe(browserSync.reload({stream: true}))
		.pipe(gulp.dest('app/css'));
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
        baseDir: 'app'
        },
		notify: false
	});
});

gulp.task('watch', ['browser-sync', 'scripts', 'style', 'scss'], function() {
	gulp.watch('app/scss/**/*.scss', ['scss']);
	gulp.watch('app/libs/**/*.js', ['scripts']);
	gulp.watch('app/libs/**/*.css', ['style']);
	gulp.watch('app/js/**/*.js', browserSync.reload);
	gulp.watch('app/css/**/*.css', browserSync.reload);
	gulp.watch('app/**/*.html', browserSync.reload);
});

gulp.task('default', ['watch']);




// При возникновении проблем с изображениями запустить таск "gulp clear".

gulp.task('clear', function () {
    return cache.clearAll();
})




// Сборка конечного проекта вызывается командой "gulp build".

gulp.task('img', function() {
    return gulp.src('app/img/**/*') 
        .pipe(imagemin({ 
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('clean', function() {
	return del.sync('dist');
});

gulp.task('build', ['clean', 'less', 'scripts', 'htmlinclude', 'img'], function() {

	var buildCss = gulp.src('app/css/**/*')
    .pipe(cssnano())
	.pipe(gulp.dest('dist/css'))

	var buildJs = gulp.src('app/js/**/*')
    .pipe(uglify())
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));

});




// Оптимизация сайта для поисковиков. Запуск выполняется командой "gulp meta".

gulp.task('sitemap', function () {
    gulp.src('dist/**/*.html', {
            read: false
        })
        .pipe(sitemap({
            siteUrl: 'http://site'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('robots', function () {
    gulp.src('dist/index.html')
        .pipe(robots({
            useragent: 'Googlebot, Yandex ',
            allow: ['dist/ '],
            disallow: ['app/ ']
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('meta', ['sitemap', 'robots' ]);