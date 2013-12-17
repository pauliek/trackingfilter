mkdir -p bin
cd src
find . -type f -name ".*" | xargs rm -rf
rm -f ../bin/trackingfilter-$1.xpi
zip -r ../bin/trackingfilter-$1.xpi .
cd ..