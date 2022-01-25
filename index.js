const { sync: glob } = require("fast-glob");
const path = require("path");

module.exports = (tsconfigPath = "./tsconfig.json") => {
  const { compilerOptions } = require(tsconfigPath);
  const pathKeys = Object.keys(compilerOptions.paths);
  const re = new RegExp(`^(${pathKeys.join("|")})`);
  return {
    name: "esbuild-ts-paths",
    setup(build) {
      build.onResolve({ filter: re }, (args) => {
        const pathKey = pathKeys.find((pkey) => new RegExp(`^${pkey}`).test(args.path));
        const [pathDir] = pathKey.split("*");
        const file = args.path.replace(pathDir, "");
        for (const dir of compilerOptions.paths[pathKey]) {
          const [matchedFile] = glob(`${path.resolve(__dirname, dir).replace("*", file)}.*`);
          if (matchedFile) {
            return { path: matchedFile };
          }
        }
        return { path: args.path };
      });
    },
  };
};
