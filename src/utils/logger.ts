export default {
  error: (msg: any, ctx = 'ERROR') => {
    console.log('\x1b[31m%s\x1b[0m', `[${ctx}]`, msg);
  },
  info: (ctx: string, msg: any) => {
    console.log('\x1b[36m%s\x1b[0m', `[${ctx}]`, msg);
  },
};
