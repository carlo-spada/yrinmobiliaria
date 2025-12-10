import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  headers?: string[];
}

export function TableSkeleton({ columns, rows = 5, headers }: TableSkeletonProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {headers
              ? headers.map((header, i) => (
                <TableHead key={i}>{header}</TableHead>
              ))
              : Array.from({ length: columns }).map((unused, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((unused, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((unused, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton
                    className={`h-4 ${colIndex === 0 ? 'w-32' :
                        colIndex === columns - 1 ? 'w-20 ml-auto' :
                          'w-24'
                      }`}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((unused, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((unused, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            {Array.from({ length: 3 }).map((unused, j) => (
              <div key={j} className="flex flex-col space-y-2 border-b pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function UserRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-8 w-8 ml-auto" />
      </TableCell>
    </TableRow>
  );
}
