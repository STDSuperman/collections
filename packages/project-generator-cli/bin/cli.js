#!/usr/bin/env node

'use strict';

const importLocal = require('import-local');
const { runCLI } = require('../dist/lib/bootstrap.js');

if (importLocal(__filename)) return;

runCLI(process.argv);