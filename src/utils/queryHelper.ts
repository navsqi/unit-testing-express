interface IPaging {
  offset?: number;
  limit?: number;
}

const paging = (qs: { [key: string]: any }): IPaging => {
  const limit = qs.limit ? Number(qs.limit) : 50;
  const page = qs.page ? +qs.page : 1;
  const offset = (Number(page) - 1) * Number(limit);

  return { limit, offset };
};

export default {
  paging,
};
