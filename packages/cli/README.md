# @engineers/auto-developer-cli

`auto developer` **(dv)** automates your work development flow, it can create a full-stack project,
manage databases and API routers, install dependencies and deploy your project into the cloud.

what you used to do manually, auto developer can do it for you automatically with just seconds.

`auto developer` automatically create any type of applications with any programming language within seconds without any coding experience from the user.
it can create a project from scratch or work with any existing project.

`auto developer` can create, for example:

- a full-stack website with any back-end language such as PHP or Node.js, and any front-end framework such as Angular, React, or Vue.
- an Android application with Java or Kotlin.
- any application with any programming language, even if the user doesn't have any experience with that language.

This idea increases the productivity to the maximum level and decreases errors, within seconds the un-experienced user can create a great application.

`auto developer` uses `builders` to create or modify your desired project.
each builder is responsible of a task or a group of tasks of the project, and you can control the builder workflow
through builder options.

you will learn how to create your own builder.

`auto developer` controls the workflow, installing the proper builders and loading them, transferring messages between the builders, maintaining the virtual tree.

## builders

`auto developer` creates the application via builders, every builder do a very scoped task into the project and the user can control what this builder can do by it’s options or via builder’s plugins.

`auto developer` create a virtual tree of the project’s dir, all builders modify the virtual tree and don’t modify any of physical files.
if any builder throwed an exception, the workflow will stop (or pause until the user select a suggested solution to fix the thrown exception) and no any modification will apply to the application.

This idea is good especially if the user want to modify an existing project.
`auto developer` will not make any changes to the current project until all builders successfully finished their tasks, and then the final virtual tree is merged with the current project at once.
This feature ensure safety and speed the process.

`auto developer` may use the AI to chat with the user in a natural human language, but it also uses simple commands to create the desired project‘s structure via `dv-cli`.

#install
install `auto developer` globally to use `dv` cli.

```
npm i -g @engineers/auto-developer
```

## usage

all you need is to create an auto-developer configuration object
you can create it in a normal json (or js) file, or at building time via CLI or GUI
or even by having a friendly chat with auto-developer by facebook messenger or whatsapp
or any other chatting service.

the default auto-developer config file is `./dv.js` in the root dir of your workspace.
the auto-developer workspace contains all your auto-developer projects.
but you can use any other file, and pass it to `dv` cmd.

and then use the `dv` cli to run the builders and complete your project.

```
dv
```

if you used other path than './dv.js' provide it to `dv` cmd

```
dv ./path/to/dv.js
```

to review the changes without applying them to the project's file system physically, use `--dry`

```
dv --dry
```

`auto developer` config is a normal object that contains:

- `config`: project-level configuration.
- `builders`: an array of builders to work with your project. every builder has two elements

  - `factory`: the builder factory is a function (or an npm package, or a path to a factory file) that do a very scoped task in your project.
  - `options`: the builder options, you can control the builder factory workflow through builder options.

  if the builder `factory` is an npm package, `auto developer` will automatically install it to you.

```
autoDeveloper = {
config:{},
builders: [ builderFactory, {options} ]
}

```

# Example

to build a CRUD app using the following technologies:

front-end: Angular
back-end: node.js with express
UI: material design
database: mongoDB
API: graphQl

and then install all packages, publish to github, and deploy the project into firebase.

```

autoDeveloper = {
  config:{
    name: "my project",
    path: "/projects/my-project",

},
  builders:[
    ['@engineers/nodejs-builder'],
    ['@engineers/angular-builder', { version: 10, routes:[] }],
    ['@engineers/angular-builder:material',{ theme: 'deeppurple-amber' }],
    ['@engineers/angular-builder:component',{ name: 'articles' }],
    ['@engineers/express-builder',{ routes:[] }],
    ['@engineers/npm-builder:install'],
    ['@engineers/npm-builder:publish'],
    ['@engineers/git-builder', { repo: 'https://github.com/eng-dibo/auto-developer.git' }],
    ['@engineers/git-builder:commit', { message:'this project is created via @engineers/auto-developer' }],
    ['@engineers/git-builder:publish'],
    ['@engineers/firebase-builder:deploy', {key: '***', ...} ],

  ]
}

```

without `auto developer` you need to wait until each step finish and install it dependencies
before starting the next step, here all jobs will run sequentially one time.

by default, `angular-builder` will install the latest-stable angular version,
and `angular-builder:material` will install the compatible material design version with the installed angular version.

we used `config.name`, so every builder needs to use `options.name` will use the same value,
to provide a different name to any builder, just add `name` to `options`.

start building

```

> dv

```

## build your own builder

the builder factory is a function that accepted:

- `tree`: the project structure
- `options`: builder options
- `config`: the project-level configuration
- `context`: a context object that contains the projects info.

and return the modified `tree` or a `rule`.
the rule is a change (delta) to be applied into the `tree` to modify it

let's create a builder that creates a txt file.

```
const { write, error } = require('@engineers/auto-developer');

function createFile( tree, options, config, context ){

  //if no path provided, use the project-level path
  options.path = options.path || config.path;

  //if 'path' is required and no path provided, throw an error.
  //when any error throwed, the whole process will stop and no any modification applied to the project files.
  if(!options.path)error('[createFile] path is required')

   write(tree, `${options.path}/${options.fileName}.txt`, options.content);

   return tree
}
```

using `typescript` you can add typing

```
 import { Tree, Rule, error } from '@engineers/auto-developer';

 function createFile( tree: Tree, options, config, context): Rule{
   ...
 }
```

you can use various functions to modify your project tree

```
write(tree, filePath, content);
read(tree, filePath, encoding='utf-8');
delete(tree, filePath);
```

also you can make advanced operations, such as working with typescript files or Angular modules.
now your builder is ready, let's test it.

```
//dv.js

 module.exports = {
   config:{
     path: 'projects/example'
     },
  builders:[
   [createFile, {fileName: 'test', content: 'hello world'}]
  ]
 }

```

to publish your builder to `npm`, just create a `package.json` file, or run `npm init`,
and then run `npm publish`.
don't forget to point `main` to your factory file.

> add `-builder` suffix to your builder name
> and add `@engineers/auto-developer, auto developer builder` to keywords.

if you published your builder to npm, you can use it by package's name.
assume you published your builder with the name `create-file-builder`

```
builders:[
  ['create-file-builder', { ... }]
]
```

`auto developer` will install and run it automatically.

you can use a specific builder's version

```
builders:[
  ['create-file-builder@1.0.0', { ... }]
]
```
