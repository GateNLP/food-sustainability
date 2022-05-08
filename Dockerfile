# This builds the react.js frontend in a temporary container
# https://mherman.org/blog/dockerizing-a-react-app/
FROM node:13.12.0-alpine as frontend
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ./frontend/package.json ./
COPY ./frontend/package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts@3.4.1 -g --silent
COPY ./frontend ./
RUN npm run build



#This builds the Spring Boot backend in a temporary container
# https://spring.io/guides/topicals/spring-boot-docker
FROM openjdk:8-jdk-alpine as backend
WORKDIR /workspace/app

COPY ./backend/mvnw .
COPY ./backend/.mvn .mvn
COPY ./backend/pom.xml .
COPY ./backend/src src

RUN ./mvnw install -DskipTests
RUN mkdir -p target/dependency && (cd target/dependency; jar -xf ../*.jar)



# This combines both the Spring Boot backend and the react.js
# frontend into a single container so everything runs in a single
# image and is all exposed via a single port
FROM openjdk:8-jdk-alpine
VOLUME /tmp
ARG DEPENDENCY=/workspace/app/target/dependency
COPY --from=backend ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY --from=backend ${DEPENDENCY}/META-INF /app/META-INF
COPY --from=backend ${DEPENDENCY}/BOOT-INF/classes /app
COPY --from=frontend /app/build /app/static

COPY ./backend/application.yml /app/config/

ENTRYPOINT ["java","-cp",".:app:app/lib/*","uk.ac.gate.alpro.dashboard.Backend"]
