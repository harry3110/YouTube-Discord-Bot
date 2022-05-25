FROM node:16

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# # # # # # #
#  ENV FILE #
# # # # # # #

ENV DOWNLOADER=youtube

# Discord
ENV DISCORD_TOKEN=
ENV APPLICATION_ID=
ENV DEV_GUILD_ID=

# Plex
ENV PLEX_HOSTNAME=
ENV PLEX_HOSTNAME_REMOTE=
ENV PLEX_TOKEN=
ENV PLEX_PORT=32400

# Last FM
ENV LF_API_KEY=
ENV LF_SECRET=

CMD ["node", "dist/index.js"]