#!/bin/bash
cd /home/loki/Documents/core/software/fresh/js/metaforecast/metaforecast-backend
date > done.txt
/home/loki/.nvm/versions/node/v16.8.0/bin/node ./src/utils/pullSuperforecastsManually.js >> done.txt
