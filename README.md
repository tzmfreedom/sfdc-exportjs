# Dockerfile of Export Tool for Salesforce.com
This repository contains Dockerfile of Export toole for Salesforce.com

## Base Docker Image
[phusion/baseimage-docker](https://github.com/phusion/baseimage-docker)

## Installation
1. Install [Docker](https://www.docker.com)
2. Pull Docker Image
```bash
docker pull tzmfree/sfdc-exportjs
```

## Usage
Create log directory.
```bash
mkdir /var/log/sfdc-exportjs
```

Run the docker container.
```bash
docker run --rm -t \
-e SFDC_USERNAME="hoge@example.com" \
-e SFDC_PASSWORD="fuga123" \
-e SFDC_LOGINURL="https://login.salesforce.com" \
-e SFDC_TARGETOBJECT="Account;Contact" \
-e SFDC_LIMIT="500000" \
-e S3_BUCKET="backup" \
-e AWS_ACCESS_KEY_ID="AKI***************" \
-e AWS_SECRET_ACCESS_KEY="********************" \
-e MODE="parallel" \
-v /var/log/sfdc-exportjs:/var/log/sfdc-exportjs \
tzmfree/sfdc-exportjs /sbin/my_init -- ./export.sh
```
The logs for exporting is stored in /var/log/sfdc-exportjs directory for the container.  
If you want to store the logs persistently, run docker command with volume option.

### Environment Variables
#### SFDC_USERNAME (required)
Salesforce login username

#### SFDC_PASSWORD (required)
Salesforce login password

#### SFDC_LOGINURL (optional)
Salesforce login URL. If you want your container to access to sandbox, set to "https://test.salesforce.com".  
If not specified, this value defaults to "https://login.salesforce.com".

#### SFDC_TARGETOBJECT (required)
Semi-colon splitted salesforce object api names.  
For example, "Account;Contact;User;CustomObject__c".

#### SFDC_LIMIT (optional)
SOQL limit size for each object.  
If not specified, this value defaults to 500,000.

#### S3_BUCKET (optional)
If you want to store your data in s3, set s3 bucket name that you want to store in.

#### AWS_ACCESS_KEY_ID (optional)
If you want to store your data in s3, set AWS_ACCESS_KEY_ID value.  
If not specified, the exported data is stored only in local file system.

#### AWS_SECRET_ACCESS_KEY (optional)
If you want to store your data to s3, set AWS_SECRET_ACCESS_KEY value.

#### MODE (optional)
If you want each exporting to work in parallel, set mode value to "parallel".  
If not specified, this value defaults to "serial" that means "work in serial".
