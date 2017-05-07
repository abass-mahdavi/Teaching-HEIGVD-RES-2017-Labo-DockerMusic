FROM node:4.3.1
MAINTAINER Abass Mahdavi <abass.mahdavi@heig-vd.ch>

#
# When we build the image, we copy the executable jar in the image file system. 
#
COPY src /opt/app/

WORKDIR /opt/app/
RUN npm install

CMD ["node", "/opt/app/musician.js"]
