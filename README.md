# esbuild-ts-paths
Transform TS path alias to absolute paths for esbuild

```javascript
const tsPaths = require("esbuild-ts-paths") 
esbuild.build({
    //...
    plugins:[
        tsPaths(
            "./path/to/tsconfig.json" // optional, defaults to ./tsconfig.json
        )
    ]
})
```
