import React from 'react';

export const Table = ({
  columns = [],
  data = [],
  emptyMessage = 'No records found.',
  onRowClick,
  className = ''
}) => {
  return (
    <div className={`overflow-x-auto w-full border border-neutral-300 rounded-card bg-white ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-neutral-100 border-b border-neutral-300 text-neutral-600 font-semibold text-xs uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th key={col.key || idx} className={`py-3 px-4 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-300 text-neutral-900">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-neutral-600 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-primary-light/40' : 'hover:bg-neutral-100/50'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={col.key || colIdx} className={`py-3.5 px-4 align-middle ${col.className || ''}`}>
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
