pipeline {
    agent any

    parameters {
        choice(name: 'DEPLOY_TARGET', choices: ['local', 'azure'], description: 'Choose deployment target: "local" (for immediate testing without Azure) or "azure" (for Azure VM)')
        string(name: 'AZURE_VM_IP', defaultValue: '', description: 'Public IP address of the Azure VM (required if DEPLOY_TARGET is azure)')
        string(name: 'AZURE_VM_USER', defaultValue: 'azureuser', description: 'SSH user for Azure VM (default: azureuser)')
        string(name: 'SSH_CREDENTIAL_ID', defaultValue: 'azure-vm-ssh-key', description: 'Jenkins SSH Credential ID for Azure VM')
        string(name: 'APP_PORT', defaultValue: '3000', description: 'Port for Ellora application (default: 3000)')
        string(name: 'ADMIN_USER', defaultValue: 'admin', description: 'Ellora administrator username')
    }

    environment {
        PATH = "/home/adhitha/.nvm/versions/node/v24.21.0/bin:${env.PATH}"
        APP_NAME = 'ellora'
        NODE_ENV = 'production'
        LOCAL_SESSION_SECRET = 'ellora-devops-test-session-secret'
    }

    triggers {
        // Automatically check GitHub every 5 minutes for new commits
        pollSCM('H/5 * * * *')
        // Automatically trigger on GitHub webhook push
        githubPush()
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo '=== Stage 1: Checkout Code from GitHub ==='
                checkout scm
                sh 'git log -1 --stat'
            }
        }

        stage('2. Install Dependencies') {
            steps {
                echo '=== Stage 2: Installing Node.js Dependencies ==='
                sh 'npm ci --prefer-offline || npm install'
            }
        }

        stage('3. Run Automated Tests') {
            steps {
                echo '=== Stage 3: Running Test Suite ==='
                sh 'npm test'
            }
        }

        stage('4. Build & Package') {
            steps {
                echo '=== Stage 4: Packaging and Preparing Application ==='
                sh '''
                    # Verify application files and build artifacts
                    test -f index.js
                    test -f package.json
                    echo "Application package integrity verified."
                '''
            }
        }

        stage('5. Deploy') {
            steps {
                script {
                    if (params.DEPLOY_TARGET == 'azure') {
                        def targetIp = params.AZURE_VM_IP ?: env.AZURE_VM_IP
                        if (!targetIp) {
                            error("AZURE_VM_IP is required when DEPLOY_TARGET is 'azure'!")
                        }

                        echo "=== Stage 5: Deploying to Azure VM (${targetIp}) via SSH ==="

                        withCredentials([
                            string(credentialsId: 'mongodb-atlas-url', variable: 'SEC_MONGO_URL'),
                            string(credentialsId: 'ellora-session-secret', variable: 'SEC_SESSION_SECRET')
                        ]) {
                            env.FINAL_MONGO_URL = env.SEC_MONGO_URL ?: env.MONGO_URL ?: ''
                            env.FINAL_SESSION_SECRET = env.SEC_SESSION_SECRET ?: env.SESSION_SECRET ?: env.LOCAL_SESSION_SECRET
                        }

                        sshagent([params.SSH_CREDENTIAL_ID]) {
                            sh """
                                SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
                                TARGET="${params.AZURE_VM_USER}@${targetIp}"

                                echo "Ensuring destination directory exists on Azure VM..."
                                ssh \${SSH_OPTS} \${TARGET} "mkdir -p ~/ellora"

                                echo "Transferring application code to Azure VM..."
                                scp \${SSH_OPTS} -r \
                                    package*.json \
                                    index.js \
                                    Dockerfile \
                                    docker-compose.yml \
                                    public \
                                    views \
                                    \${TARGET}:~/ellora/

                                echo "Configuring production environment on Azure VM..."
                                ssh \${SSH_OPTS} \${TARGET} "cat << 'EOF' > ~/ellora/.env
PORT=${params.APP_PORT}
SESSION_SECRET=${env.FINAL_SESSION_SECRET}
MONGO_URL=${env.FINAL_MONGO_URL}
ADMIN=${params.ADMIN_USER}
NODE_ENV=production
EOF"

                                echo "Deploying container via Docker Compose..."
                                ssh \${SSH_OPTS} \${TARGET} "
                                    cd ~/ellora
                                    docker compose down --remove-orphans || true
                                    docker compose up -d --build
                                "
                            """
                        }
                    } else {
                        echo "=== Stage 5: Deploying in Local Test Environment ==="
                        sh """
                            # Stop any existing instance
                            fuser -k ${params.APP_PORT}/tcp || true

                            # Write local test .env file
                            cat << 'EOF' > .env
PORT=${params.APP_PORT}
SESSION_SECRET=${env.LOCAL_SESSION_SECRET}
MONGO_URL=
ADMIN=${params.ADMIN_USER}
NODE_ENV=test
EOF

                            # Launch local test instance in background
                            nohup node index.js > app.log 2>&1 &
                            echo "Local application instance launched."
                        """
                    }
                }
            }
        }

        stage('6. Smoke Test & Health Check') {
            steps {
                script {
                    def checkHost = (params.DEPLOY_TARGET == 'azure') ? (params.AZURE_VM_IP ?: env.AZURE_VM_IP) : '127.0.0.1'
                    echo "=== Stage 6: Verifying Deployment Health at http://${checkHost}:${params.APP_PORT}/health ==="
                    
                    sh """
                        echo "Waiting 5 seconds for service initialization..."
                        sleep 5

                        # Ping health endpoint
                        curl -f --retry 5 --retry-delay 2 --retry-connrefused "http://${checkHost}:${params.APP_PORT}/health"

                        echo "Health check succeeded! Application is healthy and responding."
                    """
                }
            }
        }
    }

    post {
        success {
            script {
                def checkHost = (params.DEPLOY_TARGET == 'azure') ? (params.AZURE_VM_IP ?: env.AZURE_VM_IP) : 'localhost'
                echo """
======================================================================
  CI/CD PIPELINE EXECUTION SUCCESSFUL!
  Target: ${params.DEPLOY_TARGET}
  App URL: http://${checkHost}:${params.APP_PORT}
  Health:  http://${checkHost}:${params.APP_PORT}/health
======================================================================
"""
            }
        }
        failure {
            echo """
======================================================================
  CI/CD PIPELINE FAILED!
  Please inspect stage logs above for error details.
======================================================================
"""
        }
        always {
            script {
                if (params.DEPLOY_TARGET == 'local') {
                    // Optional: clean up local test process if desired, or keep it running for manual viewing
                    echo "Local deployment logs (last 20 lines):"
                    sh 'cat app.log 2>/dev/null | tail -n 20 || true'
                }
            }
        }
    }
}
