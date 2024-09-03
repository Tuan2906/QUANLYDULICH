import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './TourVisit.css'; // Import your CSS file
const TourVisitTable= ({ relatives }) => {
    if (!relatives || relatives.length === 0) {
        return <p>Không có dữ liệu.</p>;
      }
    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(relatives.map((relative, index) => ({
            ID: index + 1,
            Tên: relative.ten,
            "Năm sinh": relative.namsinh,
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Relatives");

        // Tạo file Excel
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const excelBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });

       // Hiển thị dialog cho phép người dùng chọn nơi lưu và tên file
        saveAs(excelBlob, `DSHK_${relatives.length}_dulich.xlsx`);
    };

    
  return (
    <div>
      
    <table className="table table-striped table-bordered custom-table">
        <thead className="thead-dark">
            <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Năm sinh</th>
            </tr>
        </thead>
        <tbody className="ml-auto">
            {relatives.map((relative, index) => (
            <tr key={relative.id}>
                <td>{index+1}</td>
                <td>{relative.ten}</td>
                <td>{relative.namsinh}</td>
            </tr>
            ))}
            <tr className="total-row">
                <td colSpan="3" style={{ textAlign: 'right' }}>Tổng số lượng: {relatives.length}</td>
            </tr>
        </tbody>
        </table>
        <div className="mt-3 d-flex">
            <div className="ml-auto">
                <button onClick={exportToExcel} className="btn btn-primary">Xuất ra Excel</button>
             </div>
        </div>

    </div>
  );
};

export default TourVisitTable;
