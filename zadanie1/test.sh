#!/usr/bin/env sh

fpc main.pas
fpc tests.pas

echo ""
echo "### MAIN ###"
echo ""
./main

echo ""
echo "### UNIT TESTS ###"
echo ""
./tests
