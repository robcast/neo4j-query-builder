# Neo4J Query Builder - A generic data browser for Neo4J

This is a data browser for [Neo4J](https://neo4j.com) databases written in Javascript 
(actually TypeScript using the [Angular](https://angular.io) framework) that can run in any modern web browser.

The data browser lets you start with an object (if you have configured an id attribute) or all objects of a 
type (a Neo4J label). Then you can add more steps to filter the results by specifying the value of an attribute 
or by selecting a relation type.

The possible types, attributes and relations for the next query step are computed from your data on the fly.

The current results are shown in a data table at the bottom. You can inspect the current query in the 
"Cypher query" section.

## Configuration

Clone this repository. In the `src/app` directory copy `app-settings.ts.template` to `app-settings.ts` 
and `app-services.ts.template` to `app-services.ts` and adjust the settings:

* **NEO4J_BASE_URL**  set this to your Neo4J server URL (plus `/db/data`).
* **NEO4J_AUTHENTICATION** set the user and password to your Neo4J server. You can remove this setting
if your server is configured without authentication.

## Angular CLI

Installation requires the [Angular CLI](https://cli.angular.io/):

* Make sure you have an up to date version of [Node.js](https://nodejs.org/en/) and NPM
* Run `npm install -g @angular/cli` (or install without -g and use `node_modules/.bin/ng`)
* Run `npm install` to install the application dependencies

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. 
The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. 
Use the `--prod` flag for a production build.

## Customization

You can customize the display of columns and use your own normalization service by replacing the
`TypeService` and the `NormalizationService` with your own implementations based on the existing
implementations and changing the `TypeServiceProvider` and `NormalizationServiceProvider` in 
`app-services.ts` to use your implementations. 

For an example of a customization see `src/app/custom/ismi`.
