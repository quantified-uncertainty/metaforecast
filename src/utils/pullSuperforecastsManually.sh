#!/bin/bash
cd /home/nuno/Documents/core/software/fresh/js/metaforecasts/metaforecasts-mongo
date > done.txt
/home/nuno/.nvm/versions/node/v16.4.2/bin/node ./src/utils/pullSuperforecastsManually.js >> done.txt
