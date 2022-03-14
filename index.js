const { sync: glob } = require("fast-glob");
const path = require("path");
const fs = require("fs");

function stripJsonComments(data) {
  return data.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => (g ? "" : m));
}

module.exports = (relativeTsconfigPath = "./tsconfig.json") => {
  const absTsconfigPath = path.resolve(process.cwd(), relativeTsconfigPath);
  let tsconfigData = fs.readFileSync(absTsconfigPath, "utf8");
  tsconfigData = stripJsonComments(tsconfigData);
  const { compilerOptions } = JSON.parse(tsconfigData);

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
          const fileDir = path.resolve(process.cwd(), dir).replace("*", file);
          let [matchedFile] = glob(`${fileDir}.*`);
          if (!matchedFile) {
            const [matchIndexFile] = glob(`${fileDir}/index.*`);
            matchedFile = matchIndexFile;
          }
          if (matchedFile) {
            return { path: matchedFile };
          }
        }
        return { path: args.path };
      });
    },
  };
};
