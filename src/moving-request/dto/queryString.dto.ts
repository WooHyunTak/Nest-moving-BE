export class QueryStringDto {
  limit: number;
  cursor: number | null;
  orderBy: { [key: string]: 'asc' | 'desc' };
}
