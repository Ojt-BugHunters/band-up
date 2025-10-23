pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'ap-southeast-1'
        AWS_ACCOUNT_ID = '243826067806'

        FRONTEND_REPO = 'bandup/frontend'
        BACKEND_REPO = 'bandup/backend'

        ECR_URL = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"

        FRONTEND_SERVICE = 'frontend-service'
        BACKEND_SERVICE = 'backend-service'
        ECS_CLUSTER = 'my-ecs-cluster'

        FRONTEND_IMAGE_TAG = "frontend-${BUILD_NUMBER}"
        BACKEND_IMAGE_TAG = "backend-${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Login to AWS ECR') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                        aws ecr get-login-password --region $AWS_DEFAULT_REGION | \
                        docker login --username AWS --password-stdin $ECR_URL
                    '''
                }
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_TOKEN')]) {
                    sh '''
                        echo "Logging into Docker Hub..."
                        echo $DOCKER_TOKEN | docker login -u $DOCKER_USER --password-stdin
                        echo "Docker Hub login successful"
                    '''
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh '''
                        docker build -t $FRONTEND_REPO:$FRONTEND_IMAGE_TAG .
                        docker tag $FRONTEND_REPO:$FRONTEND_IMAGE_TAG $ECR_URL/$FRONTEND_REPO:$FRONTEND_IMAGE_TAG
                    '''
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh '''
                        docker build -t $BACKEND_REPO:$BACKEND_IMAGE_TAG .
                        docker tag $BACKEND_REPO:$BACKEND_IMAGE_TAG $ECR_URL/$BACKEND_REPO:$BACKEND_IMAGE_TAG
                    '''
                }
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh '''
                    docker push $ECR_URL/$FRONTEND_REPO:$FRONTEND_IMAGE_TAG
                    docker push $ECR_URL/$BACKEND_REPO:$BACKEND_IMAGE_TAG
                '''
            }
        }

        // stage('Deploy to ECS') {
        //     steps {
        //         sh '''
        //             aws ecs update-service \
        //                 --cluster $ECS_CLUSTER \
        //                 --service $FRONTEND_SERVICE \
        //                 --force-new-deployment \
        //                 --region $AWS_DEFAULT_REGION

        //             aws ecs update-service \
        //                 --cluster $ECS_CLUSTER \
        //                 --service $BACKEND_SERVICE \
        //                 --force-new-deployment \
        //                 --region $AWS_DEFAULT_REGION
        //         '''
        //     }
        // }
    }

    post {
        success {
            echo "Deployment succeeded!"
            echo "Frontend: $ECR_URL/$FRONTEND_REPO:$FRONTEND_IMAGE_TAG"
            echo "Backend:  $ECR_URL/$BACKEND_REPO:$BACKEND_IMAGE_TAG"
        }
        failure {
            echo "Deployment failed."
        }
    }
}
