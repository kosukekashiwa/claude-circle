import React, { useState, useRef, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import "./App.css";

export default function PerfectCircleGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setPoints([{ x, y }] as never);
    setScore(null);
    setFeedback("");

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const draw = (e: any) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();

    setPoints((prev) => [...prev, { x, y } as never]);
  };

  const stopDrawing = () => {
    if (!isDrawing || points.length < 10) {
      setIsDrawing(false);
      return;
    }

    setIsDrawing(false);
    calculateScore();
  };

  const calculateScore = () => {
    if (points.length < 20) {
      setScore(0 as never);
      setFeedback("円が小さすぎます!");
      return;
    }

    // 中心点を計算
    const centerX =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      points.reduce((sum, p) => sum + (p as any).x, 0) / points.length;
    const centerY =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      points.reduce((sum, p) => sum + (p as any).y, 0) / points.length;

    // 各点から中心までの距離を計算
    const distances = points.map((p) =>
      Math.sqrt(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Math.pow((p as any).x - centerX, 2) +
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Math.pow((p as any).y - centerY, 2)
      )
    );

    const avgRadius =
      distances.reduce((sum, d) => sum + d, 0) / distances.length;

    // 標準偏差を計算（円の均一性）
    const variance =
      distances.reduce((sum, d) => sum + Math.pow(d - avgRadius, 2), 0) /
      distances.length;
    const stdDev = Math.sqrt(variance);

    // 開始点と終了点の距離（閉じているか）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstPoint: any = points[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastPoint: any = points[points.length - 1];
    const closingDistance = Math.sqrt(
      Math.pow(lastPoint.x - firstPoint.x, 2) +
        Math.pow(lastPoint.y - firstPoint.y, 2)
    );

    // スコア計算
    const uniformityScore = Math.max(0, 100 - (stdDev / avgRadius) * 300);
    const closingScore = Math.max(0, 100 - (closingDistance / avgRadius) * 200);

    const finalScore = Math.round(uniformityScore * 0.7 + closingScore * 0.3);
    const clampedScore = Math.min(100, Math.max(0, finalScore));

    setScore(clampedScore as never);

    // フィードバック
    if (clampedScore >= 95) {
      setFeedback("完璧です!🎉");
    } else if (clampedScore >= 85) {
      setFeedback("素晴らしい!ほぼ完璧な円です!✨");
    } else if (clampedScore >= 70) {
      setFeedback("良い円です!もう少しで完璧!");
    } else if (clampedScore >= 50) {
      setFeedback("まあまあです。もっと丸く描いてみて!");
    } else {
      setFeedback("もう一度挑戦してみましょう!");
    }

    // 完璧な円を描画
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, avgRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const reset = () => {
    setPoints([]);
    setScore(null);
    setFeedback("");
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            完璧な円描きゲーム
          </h1>
          <p className="text-gray-600">できるだけ完璧な円を描いてください!</p>
        </div>

        <div className="relative mb-6">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="border-4 border-gray-300 rounded-lg cursor-crosshair w-full bg-slate-50"
            style={{ touchAction: "none" }}
          />

          {score === null && points.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-400 text-xl font-medium">
                ここをクリックして円を描いてください
              </p>
            </div>
          )}
        </div>

        {score !== null && (
          <div className="text-center mb-6 animate-fade-in">
            <div className="mb-4">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {score}点
              </div>
              <div className="text-2xl text-gray-700 font-medium">
                {feedback}
              </div>
            </div>
            <div className="text-sm text-gray-500">緑の点線が完璧な円です</div>
          </div>
        )}

        <button
          onClick={reset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw size={20} />
          もう一度挑戦
        </button>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">遊び方:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• マウスをドラッグして円を描きます</li>
            <li>• 開始点に戻ってマウスを離すと採点されます</li>
            <li>• 円の均一性と閉じ方で採点されます</li>
            <li>• 100点満点を目指しましょう!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
