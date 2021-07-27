#!/bin/bash
cd /home/nuno/Documents/core/software/fresh/js/metaforecasts/metaforecasts-mongo
/usr/bin/node ./src/utils/pullSuperforecastsManually.js
echo "done" > done.txt
