declare var Promise: any;
declare function methodBuilder(method: string): (url: string) => (target: any, propertyKey: string, descriptor: any) => void;
declare function parameterBuilder(paramName: string): (key: string) => (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Path: (key: string) => (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Query: (key: string) => (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Body: (key: string) => (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
declare var Post: (url: string) => (target: any, propertyKey: string, descriptor: any) => void;
declare module WebAtoms.Rest {
}
