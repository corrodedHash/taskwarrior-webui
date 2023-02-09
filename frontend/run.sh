docker run -w /nuxt -p 8080:8081 --mount type=bind,source="$(pwd)",target=/nuxt -it --rm node:fermium-bullseye npx nuxt --hostname 0.0.0.0 --port 8081
