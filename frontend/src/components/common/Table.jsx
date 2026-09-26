import React from 'react';

export const Table = ({
  columns = [],
  data = [],
  emptyMessage = 'No records found.',
  onRowClick,
  className = ''
}) => {
  return (
    <div className={`overflow-x-auto w-full border border-slate-200 rounded-md bg-white shadow-none ${className}`}>
      <table className="w-full text-left border-collapse text-sm tabular-nums">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-xs uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th key={col.key || idx} className={`py-3 px-4 text-left ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-slate-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-slate-500 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/50'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={col.key || colIdx} className={`py-3 px-4 align-middle text-left ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
