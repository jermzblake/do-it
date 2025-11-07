export const checkHasMore = (page: number, pageSize: number, totalCount: number) => {
  return page * pageSize < totalCount
}
