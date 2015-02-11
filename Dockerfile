FROM phusion/baseimage:latest
MAINTAINER Makoto Tajitsu

# install package
RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get install -y npm

# create directories for work and log
RUN mkdir /root/work
RUN mkdir /var/log/sfdc-exportjs

# add source directory
ADD src /root/work

# install npm package
WORKDIR /root/work
RUN npm install

# change mode to executable
RUN chmod u+x export.sh

CMD ["/sbin/my_init"]
