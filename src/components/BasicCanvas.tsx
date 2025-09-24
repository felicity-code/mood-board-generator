import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { ImageElement, TextElement, ShapeElement, BoardElement } from '../types';

interface BasicCanvasProps {
  width: number;
  height: number;
  elements: BoardElement[];
  selectedTool: string;
  showGrid: boolean;
  onElementsChange: (elements: BoardElement[]) => void;
  onElementSelect: (elementId: string | null) => void;
}

const BasicCanvas: React.FC<BasicCanvasProps> = ({
  width,
  height,
  elements,
  selectedTool,
  showGrid,
  onElementsChange,
  onElementSelect
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({});
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  // Load images
  useEffect(() => {
    const imageElements = elements.filter(el => el.type === 'image') as ImageElement[];
    imageElements.forEach(imgEl => {
      if (!images[imgEl.src]) {
        const img = new window.Image();
        img.src = imgEl.src;
        img.onload = () => {
          setImages(prev => ({ ...prev, [imgEl.src]: img }));
        };
      }
    });
  }, [elements, images]);

  // Update transformer when selection changes
  useEffect(() => {
    if (transformerRef.current && layerRef.current) {
      const selectedNode = layerRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>, elementId: string) => {
    const updatedElements = elements.map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          position: {
            x: e.target.x(),
            y: e.target.y()
          }
        };
      }
      return el;
    });
    onElementsChange(updatedElements);
  };

  const handleTransformEnd = (e: KonvaEventObject<Event>, elementId: string) => {
    const node = e.target;
    const updatedElements = elements.map(el => {
      if (el.id === elementId) {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale and apply it to size
        node.scaleX(1);
        node.scaleY(1);

        if (el.type === 'image' || el.type === 'rectangle' || el.type === 'circle') {
          return {
            ...el,
            position: {
              x: node.x(),
              y: node.y()
            },
            size: {
              width: (el as any).size.width * scaleX,
              height: (el as any).size.height * scaleY
            },
            rotation: node.rotation()
          };
        }
        return {
          ...el,
          position: {
            x: node.x(),
            y: node.y()
          },
          rotation: node.rotation()
        };
      }
      return el;
    });
    onElementsChange(updatedElements);
  };

  const handleSelect = (elementId: string) => {
    if (selectedTool === 'select') {
      setSelectedId(elementId);
      onElementSelect(elementId);
    }
  };

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    // Clicked on empty area - deselect
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      onElementSelect(null);
    }
  };

  const renderElement = (element: BoardElement) => {

    switch (element.type) {
      case 'image':
        const imgEl = element as ImageElement;
        const img = images[imgEl.src];
        if (!img) return null;

        return (
          <KonvaImage
            key={element.id}
            id={element.id}
            image={img}
            x={imgEl.position.x}
            y={imgEl.position.y}
            width={imgEl.size.width}
            height={imgEl.size.height}
            rotation={imgEl.rotation}
            opacity={imgEl.opacity}
            draggable={selectedTool === 'select'}
            onClick={() => handleSelect(element.id)}
            onTap={() => handleSelect(element.id)}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onTransformEnd={(e) => handleTransformEnd(e, element.id)}
          />
        );

      case 'text':
        const textEl = element as TextElement;
        return (
          <Text
            key={element.id}
            id={element.id}
            text={textEl.text}
            x={textEl.position.x}
            y={textEl.position.y}
            fontSize={textEl.fontSize}
            fontFamily={textEl.fontFamily}
            fill={textEl.color}
            rotation={textEl.rotation}
            opacity={textEl.opacity}
            draggable={selectedTool === 'select'}
            onClick={() => handleSelect(element.id)}
            onTap={() => handleSelect(element.id)}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onTransformEnd={(e) => handleTransformEnd(e, element.id)}
          />
        );

      case 'rectangle':
        const rectEl = element as ShapeElement;
        return (
          <Rect
            key={element.id}
            id={element.id}
            x={rectEl.position.x}
            y={rectEl.position.y}
            width={rectEl.size.width}
            height={rectEl.size.height}
            fill={rectEl.fillColor}
            stroke={rectEl.strokeColor}
            strokeWidth={rectEl.strokeWidth}
            rotation={rectEl.rotation}
            opacity={rectEl.opacity}
            draggable={selectedTool === 'select'}
            onClick={() => handleSelect(element.id)}
            onTap={() => handleSelect(element.id)}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onTransformEnd={(e) => handleTransformEnd(e, element.id)}
          />
        );

      case 'circle':
        const circleEl = element as ShapeElement;
        return (
          <Circle
            key={element.id}
            id={element.id}
            x={circleEl.position.x}
            y={circleEl.position.y}
            radius={Math.min(circleEl.size.width, circleEl.size.height) / 2}
            fill={circleEl.fillColor}
            stroke={circleEl.strokeColor}
            strokeWidth={circleEl.strokeWidth}
            rotation={circleEl.rotation}
            opacity={circleEl.opacity}
            draggable={selectedTool === 'select'}
            onClick={() => handleSelect(element.id)}
            onTap={() => handleSelect(element.id)}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onTransformEnd={(e) => handleTransformEnd(e, element.id)}
          />
        );

      case 'line':
        const lineEl = element as ShapeElement;
        return (
          <Line
            key={element.id}
            id={element.id}
            points={[0, 0, lineEl.size.width, lineEl.size.height]}
            x={lineEl.position.x}
            y={lineEl.position.y}
            stroke={lineEl.strokeColor}
            strokeWidth={lineEl.strokeWidth}
            rotation={lineEl.rotation}
            opacity={lineEl.opacity}
            draggable={selectedTool === 'select'}
            onClick={() => handleSelect(element.id)}
            onTap={() => handleSelect(element.id)}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onTransformEnd={(e) => handleTransformEnd(e, element.id)}
          />
        );

      default:
        return null;
    }
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const gridSize = 20;
    const lines = [];

    // Vertical lines
    for (let i = 0; i <= width; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, height]}
          stroke="#e5e7eb"
          strokeWidth={1}
          listening={false}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= height; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, width, i]}
          stroke="#e5e7eb"
          strokeWidth={1}
          listening={false}
        />
      );
    }

    return lines;
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <Stage
        width={width}
        height={height}
        ref={stageRef}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer ref={layerRef}>
          {/* Grid */}
          {renderGrid()}

          {/* Elements sorted by z-index */}
          {elements
            .sort((a, b) => a.zIndex - b.zIndex)
            .map(renderElement)
          }

          {/* Transformer for selected elements */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit minimum size
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default BasicCanvas;




