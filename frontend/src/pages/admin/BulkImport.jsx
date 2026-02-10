import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const BulkImport = () => {
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'application/vnd.ms-excel' ||
            selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            selectedFile.name.endsWith('.csv'))) {
            setFile(selectedFile);
            setResults(null);
        } else {
            alert('Please select a valid Excel (.xlsx, .xls) or CSV file');
        }
    };

    const downloadTemplate = () => {
        // Create sample CSV content
        const csvContent = "name,email,password,role\nJohn Doe,john@example.com,password123,student\nJane Smith,jane@example.com,password123,instructor";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk_import_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleImport = async () => {
        if (!file) {
            alert('Please select a file first');
            return;
        }

        setImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const lines = text.split('\n').filter(line => line.trim());

                // Skip header row
                const dataLines = lines.slice(1);
                const users = dataLines.map(line => {
                    const [name, email, password, role] = line.split(',').map(item => item.trim());
                    return { name, email, password, role: role || 'student' };
                });

                const response = await api.post('/users/bulk', { users });
                setResults(response.data);
            } catch (error) {
                alert('Import failed: ' + (error.response?.data?.message || error.message));
            } finally {
                setImporting(false);
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <Link to="/admin/users" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4 transition">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Users
                </Link>
                <h2 className="text-3xl font-bold text-gray-900">Bulk Import Users</h2>
                <p className="text-gray-500 mt-1">Upload an Excel or CSV file to import multiple users at once</p>
            </div>

            {/* Instructions Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-blue-900 mb-2">File Format Requirements</h3>
                        <p className="text-sm text-blue-800 mb-3">Your file must include the following columns in this exact order:</p>
                        <div className="bg-white rounded-lg p-4 font-mono text-sm border border-blue-200">
                            <div className="grid grid-cols-4 gap-4 font-bold text-blue-900 mb-2">
                                <span>name</span>
                                <span>email</span>
                                <span>password</span>
                                <span>role</span>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-gray-600">
                                <span>John Doe</span>
                                <span>john@example.com</span>
                                <span>pass123</span>
                                <span>student</span>
                            </div>
                        </div>
                        <p className="text-sm text-blue-700 mt-3">
                            <strong>Valid roles:</strong> admin, instructor, student (defaults to student if not specified)
                        </p>
                    </div>
                </div>
            </div>

            {/* Download Template */}
            <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
                <Download className="w-4 h-4" />
                Download Sample Template
            </button>

            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-400 transition">
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-gray-900 mb-2">
                            {file ? file.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-gray-500">Excel (.xlsx, .xls) or CSV files only</p>
                    </label>
                </div>

                {file && (
                    <button
                        onClick={handleImport}
                        disabled={importing}
                        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                        {importing ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Importing...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Import Users
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Results */}
            {results && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Import Results</h3>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <p className="text-sm text-gray-600 mb-1">Total Processed</p>
                            <p className="text-3xl font-bold text-gray-900">{results.totalProcessed}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <p className="text-sm text-green-600 mb-1">Successful</p>
                            <p className="text-3xl font-bold text-green-600">{results.successCount}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 text-center">
                            <p className="text-sm text-red-600 mb-1">Failed</p>
                            <p className="text-3xl font-bold text-red-600">{results.errorCount}</p>
                        </div>
                    </div>

                    {results.results.success.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Successfully Imported ({results.results.success.length})
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {results.results.success.map((user, idx) => (
                                    <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                                        <span className="font-semibold text-green-900">{user.name}</span>
                                        <span className="text-green-700"> ({user.email}) - {user.role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.results.errors.length > 0 && (
                        <div>
                            <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                                <XCircle className="w-5 h-5" />
                                Errors ({results.results.errors.length})
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {results.results.errors.map((error, idx) => (
                                    <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                                        <span className="font-semibold text-red-900">Row {error.row}:</span>
                                        <span className="text-red-700"> {error.email} - {error.error}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkImport;
