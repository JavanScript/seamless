'use client'

import { useRef, useEffect, useState } from 'react'
import { Image as KonvaImage } from 'react-konva'
import { getFilterCSS, ImageFilters } from '../ImageFilters'
import type Konva from 'konva'

interface ImageElementProps {
  shapeProps: any
  isSelected: boolean
  onSelect: (e?: any) => void
  onChange: (props: any) => void
}

const ImageElement: React.FC<ImageElementProps> = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
}) => {
  const shapeRef = useRef<Konva.Image>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (shapeProps.src) {
      const img = new window.Image()
      img.src = shapeProps.src
      img.onload = () => {
        setImage(img)
      }
      img.onerror = () => {
        console.error("Error loading image:", shapeProps.src);
      }
    }
  }, [shapeProps.src])

  useEffect(() => {
    if (shapeRef.current) {
      const node = shapeRef.current;
      const activeFilters: Konva.Filter[] = [];
      const currentFilters = shapeProps.filters as ImageFilters || {};

      if (currentFilters.blur && currentFilters.blur > 0) activeFilters.push(Konva.Filters.Blur_);
      if (currentFilters.brightness) activeFilters.push(Konva.Filters.Brighten);
      if (currentFilters.grayscale && currentFilters.grayscale > 0) activeFilters.push(Konva.Filters.Grayscale);
      if (currentFilters.sepia && currentFilters.sepia > 0) activeFilters.push(Konva.Filters.Sepia);
      
      node.filters(activeFilters);
      if (currentFilters.blur) node.blurRadius(currentFilters.blur);
      if (currentFilters.brightness) node.brightness((currentFilters.brightness - 100) / 100);

      node.cache();
      node.getLayer()?.batchDraw();
    }
  }, [shapeProps.filters, image]);

  // Update transformer on shape changes
  useEffect(() => {
    if (isSelected && shapeRef.current) {
      shapeRef.current.getSelfRect = () => {
        return {
          x: 0,
          y: 0,
          width: shapeProps.width,
          height: shapeProps.height,
        }
      }
    }
  }, [isSelected, shapeProps])

  const handleDragEnd = (e: any) => {
    onChange({
      ...shapeProps,
      x: e.target.x(),
      y: e.target.y(),
    })
  }

  const handleTransformEnd = (e: any) => {
    // Transformer changes the scale of the node
    // We need to reset the scale and update width and height
    const node = shapeRef.current
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    // Reset scale to 1
    node.scaleX(1)
    node.scaleY(1)

    onChange({
      ...shapeProps,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
    })
  }

  const getShadowProps = () => {
    if (!shapeProps.shadowEnabled) return {}
    
    return {
      shadowBlur: shapeProps.shadowBlur,
      shadowColor: shapeProps.shadowColor,
      shadowOffsetX: shapeProps.shadowOffsetX,
      shadowOffsetY: shapeProps.shadowOffsetY,
    }
  }

  return (
    <KonvaImage
      id={shapeProps.id}
      ref={shapeRef}
      x={shapeProps.x}
      y={shapeProps.y}
      width={shapeProps.width}
      height={shapeProps.height}
      image={image}
      opacity={shapeProps.opacity}
      rotation={shapeProps.rotation}
      {...getShadowProps()}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    />
  )
}

export default ImageElement 