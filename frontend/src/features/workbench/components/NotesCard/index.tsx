import { useState, useRef, useEffect } from 'react';
import { Pencil, Type, Eraser, Trash2, Palette } from 'lucide-react';
import './styles.css';

type Tool = 'pen' | 'text' | 'eraser';

const COLORS = ['#ffffff', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];

export default function NotesCard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tool, setTool] = useState<Tool>('pen');
    const [color, setColor] = useState('#ffffff');
    const [isDrawing, setIsDrawing] = useState(false);
    const [textNote, setTextNote] = useState('');
    const [showColorPicker, setShowColorPicker] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 设置画布大小
        const resizeCanvas = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (rect) {
                canvas.width = rect.width;
                canvas.height = rect.height - 100; // 留出工具栏空间
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 加载保存的内容
        const savedData = localStorage.getItem('notes_canvas');
        if (savedData) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = savedData;
        }

        const savedText = localStorage.getItem('notes_text');
        if (savedText) setTextNote(savedText);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const saveCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            localStorage.setItem('notes_canvas', canvas.toDataURL());
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (tool === 'text') return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || tool === 'text') return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.strokeStyle = tool === 'eraser' ? '#1a1a2e' : color;
        ctx.lineWidth = tool === 'eraser' ? 20 : 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    };

    const endDrawing = () => {
        setIsDrawing(false);
        saveCanvas();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        localStorage.removeItem('notes_canvas');
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextNote(e.target.value);
        localStorage.setItem('notes_text', e.target.value);
    };

    return (
        <div className="notes-card glass-card">

            <div className="notes-header">
                <h3>智能便签</h3>
                <div className="notes-tools">
                    <button
                        className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
                        onClick={() => setTool('pen')}
                        title="画笔"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        className={`tool-btn ${tool === 'text' ? 'active' : ''}`}
                        onClick={() => setTool('text')}
                        title="文字"
                    >
                        <Type size={16} />
                    </button>
                    <button
                        className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                        onClick={() => setTool('eraser')}
                        title="橡皮擦"
                    >
                        <Eraser size={16} />
                    </button>
                    <div className="color-picker-wrapper">
                        <button
                            className="tool-btn color-btn"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            title="颜色"
                        >
                            <Palette size={16} />
                            <span className="color-dot" style={{ background: color }}></span>
                        </button>
                        {showColorPicker && (
                            <div className="color-picker">
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        className={`color-option ${color === c ? 'active' : ''}`}
                                        style={{ background: c }}
                                        onClick={() => { setColor(c); setShowColorPicker(false); }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="tool-btn danger" onClick={clearCanvas} title="清除">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="notes-content">
                {tool === 'text' ? (
                    <textarea
                        className="notes-textarea"
                        value={textNote}
                        onChange={handleTextChange}
                        placeholder="在这里输入笔记..."
                    />
                ) : (
                    <div className="canvas-wrapper">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={endDrawing}
                            onMouseLeave={endDrawing}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
