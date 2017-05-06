FROM node:4.3.1
MAINTAINER Abass Mahdavi <amh@mahdavi.org>

#
# When we build the image, we copy the executable jar in the image file system. 
#
COPY src /opt/app/

CMD ["node", "/opt/app/station.js"]
