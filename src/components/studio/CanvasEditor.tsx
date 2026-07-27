"use client";

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Type, Image as ImageIcon, Trash2, Layers, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface CanvasEditorProps {
  templateUrl: string;
  onSave: (imageDataUrl: string, jsonState: string) => void;
}

export default function CanvasEditor({ templateUrl, onSave }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState("24");
  const [fontFamily, setFontFamily] = useState("sans-serif");

  useEffect(() => {
    if (!canvasRef.current) return;

    let isMounted = true;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 500,
      backgroundColor: "#ffffff",
    });

    setCanvas(fabricCanvas);

    if (templateUrl) {
      fabric.Image.fromURL(
        templateUrl,
        (img) => {
          if (!isMounted) return;
          if (!img.width || !img.height) return;
          fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
            scaleX: 400 / img.width,
            scaleY: 500 / img.height,
          });
        },
        { crossOrigin: "anonymous" }
      );
    }

    return () => {
      isMounted = false;
      fabricCanvas.dispose();
    };
  }, [templateUrl]);

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText("Double click to edit", {
      left: 100,
      top: 150,
      fontFamily: fontFamily,
      fontSize: parseInt(fontSize, 10),
      fill: textColor,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (f) => {
      const data = f.target?.result;
      if (typeof data !== "string") return;

      fabric.Image.fromURL(data, (img) => {
        if (!img.width || !img.height) return;
        const maxDim = 200;
        const scale = Math.min(maxDim / img.width, maxDim / img.height);
        img.set({
          left: 100,
          top: 100,
          scaleX: scale,
          scaleY: scale,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };

    reader.readAsDataURL(file);
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const bringForward = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.bringForward();
      canvas.renderAll();
    }
  };

  const sendBackward = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.sendToBack();
      const bg = canvas.backgroundImage;
      if (bg && bg instanceof fabric.Image) {
        bg.sendToBack();
      }
      canvas.renderAll();
    }
  };

  useEffect(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject instanceof fabric.IText) {
      activeObject.set({
        fill: textColor,
        fontSize: parseInt(fontSize, 10),
        fontFamily: fontFamily,
      });
      canvas.renderAll();
    }
  }, [textColor, fontSize, fontFamily, canvas]);

  const handleSave = () => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 0.9,
    });
    const jsonState = JSON.stringify(canvas.toJSON());
    onSave(dataUrl, jsonState);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      <div className="w-full lg:w-80 space-y-6 border border-border bg-card p-6 rounded-lg">
        <h3 className="font-semibold text-lg pb-2 border-b border-border">Studio Controls</h3>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <Type className="h-4 w-4" /> Text Tools
          </h4>
          <Button onClick={addText} className="w-full" variant="outline" size="sm">
            Add Text Layer
          </Button>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-xs text-muted-foreground">Color</label>
              <Input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-8 p-1 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Font Size</label>
              <Select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="h-8 py-0">
                <option value="16">16px</option>
                <option value="20">20px</option>
                <option value="24">24px</option>
                <option value="32">32px</option>
                <option value="48">48px</option>
                <option value="64">64px</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Font Family</label>
            <Select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="h-8 py-0">
              <option value="sans-serif">Sans Serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
              <option value="Georgia">Georgia</option>
              <option value="Courier">Courier</option>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4" /> Add Image
          </h4>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="studio-file-upload"
            />
            <label
              htmlFor="studio-file-upload"
              className="flex items-center justify-center border border-dashed border-border hover:bg-muted p-4 rounded-md text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              Click to upload photo
            </label>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <Layers className="h-4 w-4" /> Layers
          </h4>
          <div className="flex gap-2">
            <Button onClick={bringForward} variant="outline" size="sm" className="flex-1">
              Bring Front
            </Button>
            <Button onClick={sendBackward} variant="outline" size="sm" className="flex-1">
              Send Back
            </Button>
          </div>
          <Button
            onClick={deleteSelected}
            variant="destructive"
            size="sm"
            className="w-full flex items-center justify-center gap-1"
          >
            <Trash2 className="h-4 w-4" /> Delete Layer
          </Button>
        </div>

        <Button onClick={handleSave} className="w-full flex items-center justify-center gap-1.5" size="lg">
          <Check className="h-5 w-5" /> Save Design
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="border border-border rounded-lg shadow-lg overflow-hidden bg-white">
          <canvas ref={canvasRef} />
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <RefreshCw className="h-3 w-3" /> Double click text layers to edit content
        </p>
      </div>
    </div>
  );
}
