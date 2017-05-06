/**
 * Created by jaredfarago on 12/24/15.
 */

module.exports = function(grunt) {

	grunt.initConfig({

		secret: grunt.file.readJSON('./pi_credentials.json'),

		sass: {
			compile: {
				options: {
					style: 'expanded'
				},
				files: {
					'source/css/styles.css': 'source/css/styles.scss'
				}
			}
		},
		sftp: {
			dev: {
				options: {
					host: '<%= secret.dev.host %>',
					username: '<%= secret.dev.username %>',
					password: '<%= secret.dev.password %>',
					path: '/home/pi/aquarium_monitor/',
          srcBasePath: "dist/",
					showProgress: true,
					createDirectories: true
				},
				files: {
					'./': ['dist/**/*']
				}
			},
			release: {
				options: {
					host: '<%= secret.release.host %>',
					username: '<%= secret.release.username %>',
					password: '<%= secret.release.password %>',
					path: '/home/pi/aquarium_monitor/',
          srcBasePath: "dist/",
					showProgress: true,
					createDirectories: true
				},
				files: {
					'./': ['dist/**/*']
				}
			}
		},
		watch: {
			live_reload: {
				files: 'source/**/*',
				options: {
					livereload: true,
				}
			},
			sass: {
				files: 'source/css/**/*.scss',
				tasks: [
					'sass'
				]

			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-ssh');

	grunt.registerTask('default', ['watch']);

};
