pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        DOCKER_CONFIG   = '/var/jenkins_home/.docker'
        DOCKER_BUILDKIT = '0'
        REPO_URL        = 'https://github.com/Darchek/fitness-dashboard.git'
        HOST            = 'host.docker.internal'
        BUILD_IMAGE     = "fitness-dashboard-build-${BUILD_NUMBER}"
        TEST_NET        = "fitness-dashboard-net-${BUILD_NUMBER}"
        TEST_CTR        = "fitness-dashboard-ctr-${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: "${REPO_URL}"
            }
        }

        stage('Build & Test') {
            steps {
                script {
                    sh "DOCKER_BUILDKIT=0 docker build -f Dockerfile.ci -t ${BUILD_IMAGE} ."
                    try {
                        sh "docker network create ${TEST_NET}"
                        sh "docker run -d --name ${TEST_CTR} --network ${TEST_NET} -e PORT=3001 -e HOSTNAME=0.0.0.0 ${BUILD_IMAGE}"
                        sh 'sleep 15'
                        sh "docker run --rm --network ${TEST_NET} curlimages/curl:latest curl -sf --retry 5 --retry-delay 3 http://${TEST_CTR}:3001 -o /dev/null && echo 'Dashboard health check passed'"
                    } finally {
                        sh "docker rm -f ${TEST_CTR} || true"
                        sh "docker network rm ${TEST_NET} || true"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'host-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i \$SSH_KEY \$SSH_USER@\${HOST} '
                            export PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
                            export DOCKER_BUILDKIT=0
                            set -e
                            cd /Users/mbusq/deployments/fitness/fitness-dashboard
                            git pull origin main
                            /usr/local/bin/docker build -f Dockerfile.ci -t fitness-dashboard:latest .
                            cd /Users/mbusq/deployments/fitness
                            /usr/local/bin/docker rm -f fitness-dashboard || true
                            /usr/local/bin/docker compose up -d --force-recreate fitness-dashboard
                            /usr/local/bin/docker image prune -f
                            echo "fitness-dashboard deploy complete"
                        '
                    """
                }
            }
        }
    }

    post {
        always {
            sh "docker rmi ${BUILD_IMAGE} || true"
        }
        success { echo 'fitness-dashboard redeployed successfully!' }
        failure { echo 'Pipeline failed - fitness-dashboard was NOT redeployed.' }
    }
}
