FROM phusion/baseimage:latest
MAINTAINER Makoto Tajitsu

RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get install -y npm
RUN mkdir /root/work
WORKDIR /root/work
ADD src /root/work
RUN chmod u+x export.sh
RUN npm install

CMD ["/sbin/my_init"]
