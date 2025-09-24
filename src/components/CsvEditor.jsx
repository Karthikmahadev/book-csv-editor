import React, { useRef, useState } from "react";
import "./CsvEditor.css";
import { VscEditorLayout } from "react-icons/vsc";
import { MdOutlineFileUpload } from "react-icons/md";
import { FiUpload } from "react-icons/fi";
import { LuLoader } from "react-icons/lu";
import { CiSearch, CiUser, CiFilter, CiCalendar } from "react-icons/ci";
import { FiRotateCcw, FiDownload } from "react-icons/fi";
import Papa from "papaparse";
import TableView from "./TableView";


const CsvEditor = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [titleFilter, setTitleFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [editedRows, setEditedRows] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      alert("Only CSV files are allowed");
      return;
    }

    setSelectedFile(file);
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rowsWithId = results.data.map((row, idx) => ({
          id: idx,
          ...row,
        }));
        setCsvData(rowsWithId);
        setOriginalData(rowsWithId);
        if (rowsWithId.length > 0) {
          setHeaders(Object.keys(rowsWithId[0]).filter((h) => h !== "id"));
        }
        setLoading(false);
        setCurrentPage(1);
      },
    });
  };

  const handleDownload = () => {
    if (csvData.length === 0) return;
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "edited_books.csv";
    link.click();
  };

  const handleReset = () => {
    setCsvData(originalData.map((row) => ({ ...row })));
    setEditedRows(new Set());
    setTitleFilter("");
    setAuthorFilter("");
    setGenreFilter("");
    setYearFilter("");
    setCurrentPage(1);
  };

  const handleCellChange = (rowId, header, value) => {
    const updatedData = csvData.map((row) =>
      row.id === rowId ? { ...row, [header]: value } : row
    );
    setCsvData(updatedData);

    const updatedRow = updatedData.find((r) => r.id === rowId);
    const originalRow = originalData.find((r) => r.id === rowId);

    const isRowEdited = headers.some(
      (col) => (updatedRow[col] || "") !== (originalRow[col] || "")
    );

    setEditedRows((prev) => {
      const newSet = new Set(prev);
      if (isRowEdited) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });
  };

  const filteredData = csvData.filter((row) => {
    return (
      (titleFilter === "" ||
        String(row.Title || "")
          .toLowerCase()
          .includes(titleFilter.toLowerCase())) &&
      (authorFilter === "" ||
        String(row.Author || "")
          .toLowerCase()
          .includes(authorFilter.toLowerCase())) &&
      (genreFilter === "" ||
        String(row.Genre || "").toLowerCase() === genreFilter.toLowerCase()) &&
      (yearFilter === "" || String(row.Year || "") === String(yearFilter))
    );
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = filteredData
    .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    .map((row) => {
      const originalIndex = csvData.indexOf(row);
      return { row, originalIndex };
    });
  const goToPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxVisible + 1, 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="csv-editor-main">
      <div className="csv-editor-navbar">
        <div className="csv-editor-navbar-leftside">
          <VscEditorLayout size={30} />
          <p className="csv-editor-title">CSV Editor</p>
        </div>
        <div className="csv-editor-navbar-rightside">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div className="upload-file-section">
        <div className="upload-file-section-left-side">
          <p>
            <FiUpload size={20} />
            &nbsp;Drag & drop a CSV here or{" "}
          </p>
          <button
            className="choose-file"
            onClick={() => fileInputRef.current.click()}
          >
            Choose file
          </button>
        </div>
        <div className="upload-file-section-right-side">
          {loading ? (
            <p>
              <LuLoader className="loader-spin" size={20} />
              &nbsp;Uploading...
            </p>
          ) : selectedFile ? (
            <span className="selectedfilename">{selectedFile.name}</span>
          ) : (
            <p>
              <LuLoader size={20} />
              &nbsp;Waiting for file...
            </p>
          )}
        </div>
      </div>

      {csvData.length > 0 && (
        <div className="all-filter-section">
          <div className="filter-section">
            <div className="filter-input">
              <CiSearch className="filter-icon" />
              <input
                type="text"
                placeholder="Title contains..."
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              />
            </div>
            <div className="filter-input">
              <CiUser className="filter-icon" />
              <input
                type="text"
                placeholder="Author contains..."
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
              />
            </div>
            <div className="filter-input">
              <CiFilter className="filter-icon" />
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
              >
                <option value="">Genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Fantasy">Fantasy</option>
              </select>
            </div>
            <div className="filter-input">
              <CiCalendar className="filter-icon" />
              <input
                type="number"
                placeholder="Year"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              />
            </div>
          </div>
          <div className="filtersection-buttons">
            <button className="reset-btn" onClick={handleReset}>
              <FiRotateCcw /> Reset All Edits
            </button>
            <button className="download-btn" onClick={handleDownload}>
              <FiDownload /> Download CSV
            </button>
          </div>
        </div>
      )}

      {csvData.length > 0 && (
        <>
          <TableView
            headers={headers}
            data={currentData}
            filteredData={filteredData}
            onCellChange={handleCellChange}
            editedRows={editedRows}
            startIndex={(currentPage - 1) * rowsPerPage}
          />

{currentData.length > 0 && (<>
   <div className="pagination">
            <button
              className="page-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                className={`page-btn ${
                  currentPage === pageNum ? "active" : ""
                }`}
                onClick={() => goToPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
 </>)}
       
        </>
      )}
    </div>
  );
};

export default CsvEditor;
