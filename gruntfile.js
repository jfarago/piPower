/**
 * Created by jaredfarago on 12/24/15.
 */

module.exports = function(grunt) {

	grunt.initConfig({

		secret: grunt.file.readJSON('./pi_credentials.json'),

		sftp: {
			dev: {
				options: {
					host: '<%= secret.dev.host %>',
					username: '<%= secret.dev.username %>',
					password: '<%= secret.dev.password %>',
					path: '/home/pi/aquarium_monitor/src/',
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
					path: '/home/pi/aquarium_monitor/src/',
          srcBasePath: "dist/",
					showProgress: true,
					createDirectories: true
				},
				files: {
					'./': ['dist/**/*']
				}
			},
      devServer: {
        options: {
          host: '<%= secret.dev.host %>',
          username: '<%= secret.dev.username %>',
          password: '<%= secret.dev.password %>',
          path: '/home/pi/aquarium_monitor/server/',
          srcBasePath: "src/server/",
          showProgress: true,
          createDirectories: true
        },
        files: {
          './': ['src/server/**/*']
        }
      },
      releaseServer: {
        options: {
          host: '<%= secret.release.host %>',
          username: '<%= secret.release.username %>',
          password: '<%= secret.release.password %>',
          path: '/home/pi/aquarium_monitor/server/',
          srcBasePath: "src/server/",
          showProgress: true,
          createDirectories: true
        },
        files: {
          './': ['src/server/**/*']
        }
      }
		},
		watch: {
      releaseServer: {
        files: ['src/server/**/*'],
        tasks: ['sftp:releaseServer']
      },
      devServer: {
        files: ['src/server/**/*'],
        tasks: ['sftp:devServer']
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
