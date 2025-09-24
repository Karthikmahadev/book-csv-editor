import React from "react";
import "./TableView.css";
import { MdDone } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { FaDatabase } from "react-icons/fa";

const TableView = ({ headers, data, onCellChange, editedRows }) => {
  return (
    <div className="table-container">
      <table className="styled-table">
        <thead>
          <tr>
            {headers.map((col) => (
              <th key={col}>
                {col}
                <span className="sort-icon">⇅</span>
              </th>
            ))}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.length > 0 ? (
            data.map(({ row, originalIndex }) => {
              const isEdited = editedRows.has(originalIndex);

              return (
                <tr
                  key={originalIndex}
                  className={isEdited ? "edited-row" : ""}
                >
                  {headers.map((col) => (
                    <td key={col}>
                      <input
                        type="text"
                        value={row[col] || ""}
                        onChange={(e) =>
                          onCellChange(originalIndex, col, e.target.value)
                        }
                        style={{
                          border: "none",
                          background: "transparent",
                          width: "100%",
                          outline: "none",
                        }}
                      />
                    </td>
                  ))}
                  <td className="status-cell">
                    {isEdited ? (
                      <span className="edited-marker">
                        <CiEdit size={20} /> Edited
                      </span>
                    ) : (
                      <span className="not-edited-marker">
                        <MdDone size={20} /> Not Edited
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={headers.length + 1} className="no-data-available">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="table-footer">
        <span>
          <FaDatabase size={20} /> Rows: {data.length}
        </span>
        <span>
          <CiEdit /> Edits: {editedRows.size}
        </span>
      </div>
    </div>
  );
};

export default TableView;
