import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { CloseIcon } from './Icons';

const CodeEditor = ({ code, language = 'javascript', onClose, onSave, problemName }) => {
    const [editorCode, setEditorCode] = useState(code || '');
    const [selectedLanguage, setSelectedLanguage] = useState(language);
    const [editorHeight, setEditorHeight] = useState(500);
    const containerRef = useRef(null);

    useEffect(() => {
        setEditorCode(code || '');
    }, [code]);

    useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                const containerHeight = containerRef.current.clientHeight;
                const headerHeight = 80; // Approximate header height
                const footerHeight = 80; // Approximate footer height
                const calculatedHeight = Math.max(400, window.innerHeight - headerHeight - footerHeight - 100);
                setEditorHeight(calculatedHeight);
            }
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    const handleSave = () => {
        if (onSave) {
            onSave(editorCode);
        }
    };

    const languages = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' },
        { value: 'c', label: 'C' },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-2 md:p-4">
            <div
                ref={containerRef}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {problemName ? `Code Template: ${problemName}` : 'Code Template Editor'}
                        </h3>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                            {languages.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Editor */}
                <div className="flex-1 overflow-hidden bg-gray-900" style={{ minHeight: '400px' }}>
                    <Editor
                        height={`${editorHeight}px`}
                        language={selectedLanguage}
                        value={editorCode}
                        onChange={(value) => setEditorCode(value || '')}
                        theme="vs-dark"
                        loading={
                            <div className="flex items-center justify-center h-full bg-gray-900 dark:bg-gray-800 text-white">
                                <div className="text-lg">Loading editor...</div>
                            </div>
                        }
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                            readOnly: false,
                            tabSize: 2,
                            lineNumbers: 'on',
                            roundedSelection: false,
                            cursorStyle: 'line',
                            folding: true,
                            lineDecorationsWidth: 10,
                            lineNumbersMinChars: 3,
                        }}
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                        Save Template
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;

