#!/usr/bin/env node

"use strict";

const importLocal = require("import-local");
const runCLI = require("../lib/bootstrap");

if (importLocal(__filename)) return;

runCLI(process.argv);