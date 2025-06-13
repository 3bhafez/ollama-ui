import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for handling text selection within a specific element
 * @param {React.RefObject} containerRef - Reference to the container element
 * @returns {Object} - Selection state and handlers
 */
export const useTextSelection = (containerRef) => {
  const [selection, setSelection] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionTimeoutRef = useRef(null);

  // Get text content and calculate character indices
  const getTextContent = useCallback(() => {
    if (!containerRef.current) return '';
    // Get the raw text content without any HTML formatting
    return containerRef.current.textContent || '';
  }, [containerRef]);

  // Convert DOM selection to character indices
  const getSelectionIndices = useCallback(() => {
    const windowSelection = window.getSelection();
    if (!windowSelection.rangeCount || !containerRef.current) {
      return null;
    }

    const range = windowSelection.getRangeAt(0);
    const containerElement = containerRef.current;

    // Check if selection is within our container
    if (!containerElement.contains(range.commonAncestorContainer)) {
      return null;
    }

    // Get the raw text content
    const fullText = getTextContent();
    
    // Create ranges to calculate character positions
    const preRange = document.createRange();
    preRange.selectNodeContents(containerElement);
    preRange.setEnd(range.startContainer, range.startOffset);
    
    const fromIndex = preRange.toString().length;
    const toIndex = fromIndex + range.toString().length;
    const selectedText = range.toString();

    // Selection range logged for debugging

    // Validate selection
    if (fromIndex === toIndex || selectedText.trim() === '') {
      return null;
    }

    return {
      fromIndex,
      toIndex,
      selectedText,
      range: range.cloneRange()
    };
  }, [containerRef, getTextContent]);

  // Handle selection change
  const handleSelectionChange = useCallback(() => {
    // Clear previous timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    // Debounce selection changes
    selectionTimeoutRef.current = setTimeout(() => {
      const selectionData = getSelectionIndices();
      setSelection(selectionData);
      setIsSelecting(false);
    }, 100);
  }, [getSelectionIndices]);

  // Handle mouse up event
  const handleMouseUp = useCallback((event) => {
    // Only handle if the event is within our container
    if (!containerRef.current?.contains(event.target)) {
      return;
    }

    setIsSelecting(true);
    handleSelectionChange();
  }, [containerRef, handleSelectionChange]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelection(null);
    setIsSelecting(false);
    window.getSelection()?.removeAllRanges();
  }, []);

  // Get selection position for popup positioning
  const getSelectionPosition = useCallback(() => {
    if (!selection?.range) return null;

    const rect = selection.range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (!containerRect) return null;

    return {
      top: rect.bottom - containerRect.top,
      left: rect.left - containerRect.left + (rect.width / 2),
      width: rect.width,
      height: rect.height
    };
  }, [selection, containerRef]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    container.addEventListener('mouseup', handleMouseUp);

    // Cleanup
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      container.removeEventListener('mouseup', handleMouseUp);
      
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [containerRef, handleSelectionChange, handleMouseUp]);

  // Clear selection when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        clearSelection();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [containerRef, clearSelection]);

  return {
    selection,
    isSelecting,
    clearSelection,
    getSelectionPosition,
    getTextContent
  };
};