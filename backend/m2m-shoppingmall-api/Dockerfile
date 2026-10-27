# ---- build ----
# gradle wrapper(9.x) 대신 Spring Boot 3.3 플러그인과 호환이 확인된 Gradle 8.14 이미지로 빌드
FROM gradle:8.14-jdk17 AS build
WORKDIR /app
COPY settings.gradle build.gradle ./
RUN gradle dependencies --no-daemon > /dev/null 2>&1 || true   # 의존성 캐시 (소스만 바뀌면 재사용)
COPY src ./src
RUN gradle bootJar -x test --no-daemon \
 && cp "$(ls build/libs/*.jar | grep -v plain | head -n 1)" /app/app.jar

# ---- run ----
FROM eclipse-temurin:17-jre
WORKDIR /app
ENV TZ=Asia/Seoul
COPY --from=build /app/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
