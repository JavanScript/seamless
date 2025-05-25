'use client'

import { useRef, useEffect, useState } from 'react'
import { Text, Transformer } from 'react-konva'

interface TextElementProps {
  shapeProps: any
  isSelected: boolean
  onSelect: () => void
  onChange: (props: any) => void
  isNew?: boolean
}

const TextElement: React.FC<TextElementProps> = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  isNew,
}) => {
  const shapeRef = useRef<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Effect to auto-focus and enter edit mode if it's a new element
  useEffect(() => {
    if (isNew && shapeRef.current && !isEditing) {
      // Timeout to ensure the element is rendered and selectable by Konva
      // and that any selection logic from canvas click has completed.
      setTimeout(() => {
        onSelect() // Ensure it's selected for the transformer to appear
        handleDblClick()
        // We might want to remove the 'isNew' prop from the element's state after this,
        // but that would require passing onChange for this specific purpose or handling it in page.tsx
        // For now, isNew is only a transient prop for initial rendering.
      }, 50)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew]) // Only run when isNew changes (effectively on mount if isNew is true)

  // Update transformer on shape changes
  useEffect(() => {
    if (isSelected && shapeRef.current) {
      shapeRef.current.getSelfRect = () => {
        return {
          x: 0,
          y: 0,
          width: shapeRef.current.width(),
          height: shapeRef.current.height(),
        }
      }
    }
  }, [isSelected])

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

    // Reset scale to 1
    node.scaleX(1)
    node.scaleY(1)

    onChange({
      ...shapeProps,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      width: Math.max(10, node.width() * scaleX),
      // No need to change height for text
    })
  }

  const handleDblClick = () => {
    setIsEditing(true)

    // Create textarea over canvas
    const textNode = shapeRef.current
    if (!textNode) return

    const textPosition = textNode.absolutePosition()
    const stageElement = textNode.getStage().container()

    // Calculate position relative to the stage
    const areaPosition = {
      x: textPosition.x,
      y: textPosition.y,
    }

    // Create textarea
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)

    textarea.value = shapeProps.text
    textarea.style.position = 'absolute'
    textarea.style.top = `${areaPosition.y}px`
    textarea.style.left = `${areaPosition.x}px`
    textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`
    textarea.style.height = `${textNode.height() - textNode.padding() * 2}px`
    textarea.style.fontSize = `${shapeProps.fontSize}px`
    textarea.style.border = 'none'
    textarea.style.padding = '0px'
    textarea.style.margin = '0px'
    textarea.style.overflow = 'hidden'
    textarea.style.background = 'none'
    textarea.style.outline = 'none'
    textarea.style.resize = 'none'
    textarea.style.lineHeight = `${shapeProps.lineHeight || 1}`
    textarea.style.fontFamily = `${shapeProps.fontFamily || 'Arial'}`
    textarea.style.color = shapeProps.fill
    textarea.style.transformOrigin = 'left top'
    textarea.style.textAlign = shapeProps.align || 'left'
    textarea.style.fontWeight = shapeProps.fontStyleBold ? 'bold' : 'normal'
    textarea.style.fontStyle = shapeProps.fontStyleItalic ? 'italic' : 'normal'
    textarea.style.textDecoration = shapeProps.textDecorationUnderline ? 'underline' : 'none'

    textarea.focus()

    let removed = false; // Flag to prevent multiple removals
    function removeTextarea() {
      if (removed) return;
      removed = true;
      // Check if textarea is still a child of body before removing
      if (textarea.parentNode === document.body) {
        document.body.removeChild(textarea);
      }
      window.removeEventListener('click', handleOutsideClick);
      // Also remove keydown listener
      textarea.removeEventListener('keydown', handleEnterKey);
      setIsEditing(false);
    }

    function handleOutsideClick(e: MouseEvent) {
      if (e.target !== textarea) {
        const newText = textarea.value;
        if (newText !== shapeProps.text) {
          onChange({
            ...shapeProps,
            text: newText,
          });
        }
        removeTextarea();
      }
    }

    // Handle Enter key to close textarea
    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const newText = textarea.value;
        if (newText !== shapeProps.text) {
          onChange({
            ...shapeProps,
            text: newText,
          });
        }
        removeTextarea();
      }
    };

    // Handle outside click to close textarea
    setTimeout(() => {
      // Only add if not already removed (e.g. by quick Enter press)
      if (!removed) {
        window.addEventListener('click', handleOutsideClick);
      }
    }, 0); // SetTimeout with 0 to allow current event loop to finish

    textarea.addEventListener('keydown', handleEnterKey);
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

  // Determine fontStyle string for Konva
  let konvaFontStyle = '';
  if (shapeProps.fontStyleBold) konvaFontStyle += 'bold ';
  if (shapeProps.fontStyleItalic) konvaFontStyle += 'italic';
  if (konvaFontStyle === '') konvaFontStyle = 'normal';

  // Determine textDecoration string for Konva
  const konvaTextDecoration = shapeProps.textDecorationUnderline ? 'underline' : '';

  return (
    <Text
      id={shapeProps.id}
      ref={shapeRef}
      x={shapeProps.x}
      y={shapeProps.y}
      text={shapeProps.text}
      fontSize={shapeProps.fontSize}
      fontFamily={shapeProps.fontFamily}
      fill={shapeProps.fill}
      align={shapeProps.align}
      width={shapeProps.width}
      opacity={shapeProps.opacity}
      rotation={shapeProps.rotation}
      fontStyle={konvaFontStyle.trim()}
      textDecoration={konvaTextDecoration}
      {...getShadowProps()}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      perfectDrawEnabled={false}
    />
  )
}

export default TextElement 