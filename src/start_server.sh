#!/usr/bin/env bash
while true
do
	node bin\start-api.js
	if [ ! $? == 3 ]; then
		exit
	fi
done