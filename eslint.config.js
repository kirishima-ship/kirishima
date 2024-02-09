import { common, modules, node, extend, stylistic, ignores, typescript } from "@hazmi35/eslint-config";

export default [
    ...common,
    ...modules,
    ...node,
    ...stylistic,
    ...extend(typescript, [
        {
            rule: "@typescript-eslint/no-unnecessary-condition",
            option: ["off"]
        },
        {
            rule: "@typescript-eslint/no-unsafe-declaration-merging",
            option: ["off"]
        },
        {
            rule: "@typescript-eslint/no-base-to-string",
            option: ["off"]
        },
        {
            rule: "@typescript-eslint/naming-convention",
            option: ["off"]
        }
    ]),
    ...ignores
];
