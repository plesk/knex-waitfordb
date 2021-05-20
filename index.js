#! /usr/bin/env node
'use strict'

const path = require('path');
const yargs = require('yargs/yargs')

const KNEXFILE_DEFAULT = 'knexfile';
const RETRY_DEFAULT = 100;
const DELAY_DEFAULT = 1;
const TESTSQL = 'select 1+1';

const sleep = (time) => new Promise((r) => setTimeout(r, time));

const retry = async (fn, attempts, delaySeconds) => {
    for (let i = 1; i <= attempts; i++) {
        try {
            await fn();
            return true;
        } catch (error) {
            console.warn(`Attempt #${i}/${attempts} failed: ${error.message}`);
        }
        if (i < attempts) {
            await sleep(1000 * delaySeconds);
        }
    }
    return false;
};

const checkConnection = async (config) => {
	const knex = require('knex')(config);
	try {
		await knex.raw(TESTSQL);
	} finally {
		await knex.destroy();
	}
}

const checkKnexInstalled = () => {
	try {
		require('knex');
	} catch (e) {
		return false;
	}
	return true;
}

const validateConfig = (args) => {
	return {
		retry: Number(args.retry) || RETRY_DEFAULT,
		delay: Number(args.delay) || DELAY_DEFAULT,
		knexfile: args.config || KNEXFILE_DEFAULT,
	}
}

const waitfordb = async (args) => {
	const config = validateConfig(args)
	const knexConfig = require(path.join(process.cwd(), config.knexfile))
	
	if (!checkKnexInstalled()) {
		console.error("ERROR: Knex is not installed. Please run 'npm install knex'");
		return process.exit(1);
	}
	
	const rc = await retry(() => checkConnection(knexConfig), config.retry, config.delay);
	
	if (rc) {
		console.info('Database connection successful');
		return process.exit(0);
	} else {
		console.error('ERROR: There are no more attempts left, exiting...');
		return process.exit(1);
	}
}

waitfordb(yargs(process.argv.slice(2)).argv)

