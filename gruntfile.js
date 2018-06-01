/**
 * Created by jaredfarago on 12/24/15.
 */

module.exports = function(grunt) {
	grunt.initConfig({
    config: grunt.file.readJSON('./src/server/config.json'),
		secret: grunt.file.readJSON('./pi_credentials.json'),

		sftp: {
			dev: {
				options: {
					host: '<%= secret.dev.host %>',
					username: '<%= secret.dev.username %>',
					password: '<%= secret.dev.password %>',
					path: '<%= config.app.path %>',
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
					path: '<%= config.app.path %>',
					showProgress: true,
					createDirectories: true
				},
				files: {
					'./': ['dist/**/*']
				}
			}
		},
		watch: {
      release: {
        files: ['dist/**/*'],
        tasks: ['sftp:release']
      },
      dev: {
        files: ['dist/**/*'],
        tasks: ['sftp:dev']
      }
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-ssh');

	grunt.registerTask('default', ['watch'])
  ;
	grunt.registerTask('deployDev', ['sftp:dev', 'sftp:devServer']);
	grunt.registerTask('deployRelease', ['sftp:release', 'sftp:releaseServer']);

};
