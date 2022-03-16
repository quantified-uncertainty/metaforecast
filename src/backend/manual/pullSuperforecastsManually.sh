#!/bin/bash
cd /home/loki/Documents/core/software/fresh/js/metaforecast/metaforecast-backend
date > ./notes/last-superforecast-pull.txt
/home/loki/.nvm/versions/node/v16.8.0/bin/node ./src/manual/pullSuperforecastsManually.js >> ./notes/last-superforecast-pull.txt