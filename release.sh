#!/usr/bin/env bash

npm version --no-commit-hooks $(conventional-recommended-bump -p angular)
