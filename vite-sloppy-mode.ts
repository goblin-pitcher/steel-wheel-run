import { PluginOption } from "vite";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate, { GeneratorResult } from "@babel/generator";
import * as t from "@babel/types";

interface sloppyModeParams {
  include?: RegExp|RegExp[];
  exclude?: RegExp|RegExp[];
}

const viteSloppyMode = (params?: sloppyModeParams): PluginOption => {
  const { include = /\.js?$/, exclude = [] } = params || {};
  const includeArr = ([] as RegExp[]).concat(include);
  const excludeArr = ([] as RegExp[]).concat(exclude);
  const checkFilePath = (filePath: string) => {
    return includeArr.some(reg => reg.test(filePath))
            && excludeArr.every(reg => !(reg.test(filePath)));
  };

  const findInScope = (scope, name) => {
    let hasFound = false;
    const traverse = (innerScope) => {
        if (hasFound || !innerScope) {
         return;
        }
        hasFound = name in (innerScope.bindings || {});
        traverse(innerScope.parent);
      };
    traverse(scope);
    return hasFound;
  };

  return {
    name: "sloppy-mode",
    transform: async (code: string, id: string) => {
			let newCode = code;
			let sourcemap: GeneratorResult["map"] = null;
      if (!checkFilePath(id)) {
       return {
        code: newCode,
        map: sourcemap
       };
      }

      const ast = parser.parse(code, {
        sourceType: "module",
        sourceFilename: id
      });

      const names = new Set<string>();
      traverse(ast, {
        enter(path) {
          if (t.isAssignmentExpression(path.node)) {
            const name = (path.node.left as t.Identifier)?.name || "";
            if (!name) {
             return;
            }
            const hasFound = findInScope(path.scope, name);
            if (!hasFound) {
              names.add(name);
            }
          }
        },
        exit(path) {
          if (t.isProgram(path.node)) {
            if (!names.size) {
             return;
            }
            const idx = path.node.body.findIndex(item => !t.isImportDeclaration(item));
            const declarators = [...names].map((name) => t.variableDeclarator(t.identifier(name), null));
            const varibles = t.variableDeclaration("var", declarators);
            path.node.body.splice(idx, 0, varibles);
          }
        }
      });

      const output = generate(ast);
      return output;
    }
  };
};

export { viteSloppyMode };
