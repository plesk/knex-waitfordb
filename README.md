# knex-waitfordb
Waiting knex database connection

## Requirements
You must install knex in your project

## Usage
Add premigrate script to package.json to wait for initialize database before starting migration
```
"scripts": {
  "premigrate": "knex-waitfordb",
  "migrate": "knex migrate:latest"
}
```
You can use arguments to set repeat or delay, see Options
```sh
knex-waitfordb --retry 100 --delay 1
```

## Options
| Option | Default | Description |
| --- | --- | --- |
| retry | 100 | How many times to try to connect |
| delay | 1 | Timeout between attempts in seconds |
| config | knexfile | Knex config file for require |

