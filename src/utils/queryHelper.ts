interface IPaging {
   offset?: number | boolean;
   limit?: number | boolean;
} 

const paging = (qs: {[key: string]: any}): IPaging => {
   const limit = qs.limit ? { limit: Number(qs.limit) } : false;
   const page = qs.page ? { page: Number(qs.page) > 0 ? Number(qs.page) : 1 } : false;
   const offset = page ? { offset: (Number(qs.page) - 1) * Number(qs.limit) } : false;
 
   return { ...limit, ...offset };
 };

 const queryHelper = {
    paging
 }

 export default queryHelper;