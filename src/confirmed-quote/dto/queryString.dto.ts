export class OffsetQueryStringDto {
  pageSize: number;
  pageNum: number;
}

export class CursorQueryStringDto {
  cursor: string;
  limit: number;
}
