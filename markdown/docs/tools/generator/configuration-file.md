---
title: "Configuration file"
weight: 90
---

You can configure your AsyncAPI Generator template using either a dedicated `.ageneratorrc` YAML file or through the `generator` property in your `package.json` file. Previously, generator configuration had to be defined in the `package.json` file. Now, you can define the configuration in a separate `.ageneratorrc` file. The configuration defined in the `.ageneratorrc` file will override any configuration defined in `package.json`. The generator will first check for the `.ageneratorrc` file in the template's root directory, and if not found, it will look for the generator config in `package.json`.

---

## Configuration Methods

### Option 1: Using `.ageneratorrc` file (Recommended)

Create a `.ageneratorrc` file in the root of your template with YAML syntax. This approach keeps your template configuration separate from package metadata:

```yaml
renderer: react
apiVersion: v3
supportedProtocols:
  - amqp
  - mqtt
parameters:
  server:
    description: The server you want to use in the code.
    required: true
  dummyParameter:
    description: Example of parameter with default value.
    default: just a string
    required: false
conditionalFiles:
  path/to/file/that/is/relative/to/template/dir/test-amqp.js:
    subject: server.protocol
    validation:
      const: amqp
  path/to/file/that/is/relative/to/template/dir/support.html:
    subject: info.contact
    validation:
      required:
        - url
nonRenderableFiles:
  - src/api/middlewares/*.*
  - lib/lib/config.js
generator: <"2.0.0"
filters:
  - my-package-with-filters
hooks:
  '@asyncapi/generator-hooks': hookFunctionName
  my-custom-hooks-package:
    - myHook
    - andAnotherOne
```

---

### Option 2: Using `package.json`

Alternatively, you can include your configuration in the `generator` property of your `package.json` file:

```json
"generator": {
  "renderer": "react",
  "apiVersion": "v3",
  "supportedProtocols": ["amqp", "mqtt"],
  "parameters": {
    "server": {
      "description": "The server you want to use in the code.",
      "required": true
    },
    "dummyParameter": {
      "description": "Example of parameter with default value.",
      "default": "just a string",
      "required": false
    }
  },
  "conditionalFiles": {
    "path/to/file/that/is/relative/to/template/dir/test-amqp.js": {
      "subject": "server.protocol",
      "validation": {
        "const": "amqp"
      }
    },
    "path/to/file/that/is/relative/to/template/dir/support.html": {
      "subject": "info.contact",
      "validation": {
        "required": ["url"]
      }
    }
  },
  "nonRenderableFiles": [
    "src/api/middlewares/*.*",
    "lib/lib/config.js"
  ],
  "generator": "<2.0.0",
  "filters": [
    "my-package-with-filters"
  ],
  "hooks": {
    "@asyncapi/generator-hooks": "hookFunctionName",
    "my-custom-hooks-package": ["myHook", "andAnotherOne"]
  }
}
```

> **Note:** If both `.ageneratorrc` file and the `generator` property in `package.json` exist, the configuration from `.ageneratorrc` will override the `package.json` configuration.

The `generator` property from `package.json` file and must contain a JSON object and the `ageneratorrc` file must contain a YAML object that may have the following information:

|Name|Type|Description|
|---|---|---|
|`renderer`| String | Its value can be either `react` or `nunjucks` (default).
|`apiVersion`| String | Determines which **major** version of the [Parser-API](https://github.com/asyncapi/parser-api) the template uses. For example, `v2` for `v2.x.x`. If not specified, the Generator assumes the template is not compatible with the Parser-API so it will use the [Parser-JS v1 API](https://github.com/asyncapi/parser-js/tree/v1.18.1#api-documentation). For templates that need to support AsyncAPI specification v3 make sure to use `v3` [Parser-API](https://github.com/asyncapi/parser-api). If the template uses a version of the Parser-API that is not supported by the Generator, the Generator will throw an error.
|`supportedProtocols`| [String] | A list with all the protocols this template supports.
|`parameters`| Object[String, Object] | An object with all the parameters that can be passed when generating the template. When using the command line, it's done by indicating `--param name=value` or `-p name=value`.
|`parameters[param].description`| String | A user-friendly description about the parameter.
|`parameters[param].default`| Any | Default value of the parameter if not specified. Shouldn't be used for mandatory `required=true` parameters.
|`parameters[param].required`| Boolean | Whether the parameter is required or not.
|`conditionalFiles`| Object[String, Object] | An object containing all the file paths that should be conditionally rendered. Each key represents a file path and each value must be an object with the keys `subject` and `validation`. The file path should be relative to the `template` directory inside the template.
|`conditionalFiles[filePath].subject`| String | The `subject` is a [JMESPath](http://jmespath.org/) query to grab the value you want to apply the condition to. It queries an object with the whole AsyncAPI document and, when specified, the given server. The object looks like this: `{ asyncapi: { ... }, server: { ... } }`. If the template supports `server` parameter, you can access server details like for example protocol this way: `server.protocol`. During validation with `conditionalFiles` only the server that template user selected is available in the specification file. For more information about `server` parameter [read about special parameters](#special-parameters).
|`conditionalFiles[filePath].validation`| Object | The `validation` is a JSON Schema Draft 07 object. This JSON Schema definition will be applied to the JSON value resulting from the `subject` query. If validation doesn't have errors, the condition is met, and therefore the given file will be rendered. Otherwise, the file is ignored. Check [JSON Schema Validation](https://json-schema.org/draft-07/json-schema-validation.html#rfc.section.6) document for a list of all possible validation keywords.
|`nonRenderableFiles`| [String] | A list of file paths or [globs](https://en.wikipedia.org/wiki/Glob_(programming)) that must be copied "as-is" to the target directory, i.e., without performing any rendering process. This is useful when you want to copy binary files.
|`generator`| [String] | A string representing the generator version-range the template is compatible with. This value must follow the [semver](https://nodejs.dev/learn/semantic-versioning-using-npm) syntax. E.g., `>=1.0.0`, `>=1.0.0 <=2.0.0`, `~1.0.0`, `^1.0.0`, `1.0.0`, etc. [Read more about semver](https://docs.npmjs.com/about-semantic-versioning).
|`filters`| [String] | A list of modules containing functions that can be used as Nunjucks filters. In case of external modules, remember they need to be added as a dependency in `package.json` of your template.
|`hooks`| Object[String, String] or Object[String, Array[String]] | A list of modules containing hooks, except for the ones you keep locally in your template in the default location. For each module you must specify the exact name of the hook that should be used in the template. For a single hook, you can specify it as a string; for more hooks, you must pass an array of strings. In the case of external modules, remember they need to be added as a dependency in `package.json` of your template. There is also [an official hooks library](hooks#official-library) always included in the generator. As this is a library of multiple hooks, you still need to explicitly specify in the configuration which one you want to use. Use `@asyncapi/generator-hooks` as the library name.


## Special parameters

There are some template parameters that have a special meaning:

|Name|Description|
|---|---|
|`server`| It is used to let the template know which server from the AsyncAPI specification file you want to use. In some cases, this may be required. For instance, when generating code that connects to a specific server. Use this parameter in case your template relies on users' information about what server from the specification file they want to use during generation. You also need this parameter if you want to use `server.protocol` notation within `conditionalFiles` configuration option. Once you decide to specify this parameter for your template, it is recommended you make it a mandatory parameter otherwise a feature like `conditionalFiles` is not going to work if your users do not use this parameter obligatory.


