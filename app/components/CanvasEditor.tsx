"use client";

import { useState, useRef, useEffect } from "react";
import Canvas, { ShapeType, CanvasElement, CanvasHandle } from "./Canvas";
import Toolbar from "./Toolbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CanvasEditor = () => {
  const [tool, setTool] = useState<ShapeType>("rectangle");
  const [color, setColor] = useState<string>("#3B82F6");
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [textValue, setTextValue] = useState<string>("");
  const [hasSelection, setHasSelection] = useState<boolean>(false);
  
  // Reference to Canvas component methods
  const canvasRef = useRef<CanvasHandle>(null);
  
  // Poll for selection changes
  useEffect(() => {
    const checkSelection = () => {
      if (canvasRef.current) {
        setHasSelection(canvasRef.current.hasSelection());
      }
    };
    
    // Check initially and then periodically
    checkSelection();
    const interval = setInterval(checkSelection, 100);
    
    // Clean up
    return () => clearInterval(interval);
  }, []);
  
  // Handle tool selection
  const handleToolChange = (selectedTool: ShapeType) => {
    setTool(selectedTool);
    if (selectedTool === "text") {
      setShowTextInput(true);
    } else {
      setShowTextInput(false);
    }
  };
  
  // Handle color selection
  const handleColorChange = (selectedColor: string) => {
    setColor(selectedColor);
  };
  
  // Add element to canvas
  const handleAddElement = () => {
    if (canvasRef.current) {
      if (tool === "text") {
        canvasRef.current.addElement(tool, { 
          fill: color,
          text: textValue || "Text"
        });
        setTextValue("");
        setShowTextInput(false);
      } else {
        canvasRef.current.addElement(tool, { fill: color });
      }
    }
  };
  
  // Delete selected element
  const handleDeleteSelected = () => {
    if (canvasRef.current) {
      canvasRef.current.deleteSelected();
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-[200px] flex flex-col gap-4">
        <Toolbar
          onToolChange={handleToolChange}
          onColorChange={handleColorChange}
          onAddElement={handleAddElement}
          onDeleteSelected={handleDeleteSelected}
          selectedTool={tool}
          selectedColor={color}
          hasSelection={hasSelection}
        />
        
        {showTextInput && (
          <div className="flex flex-col gap-2 p-3 border border-border rounded-md">
            <label className="text-sm font-medium">Text Content</label>
            <Input
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Enter text"
            />
            <Button onClick={handleAddElement} className="mt-2">
              Add Text
            </Button>
          </div>
        )}      </div>
      <div className="flex-grow">
        <Canvas 
          width={800} 
          height={600} 
          ref={canvasRef}
        />
      </div>
    </div>
  );
};

export default CanvasEditor;
