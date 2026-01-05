import React, { useState, useEffect, useCallback } from 'react';
import styles from './FontSizeControl.module.css';

interface FontSizeControlProps {
  className?: string;
}

const FontSizeControl: React.FC<FontSizeControlProps> = ({ className }) => {
  const [fontSize, setFontSize] = useState(16); // Default font size in px
  const [isVisible, setIsVisible] = useState(true);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const minSize = 12;
  const maxSize = 24;

  // Calculate reading time
  const calculateReadingTime = useCallback(() => {
    if (typeof window !== 'undefined') {
      const content = document.querySelector('article, .markdown') || document.querySelector('main');
      if (content) {
        const text = content.textContent || '';
        const wordsPerMinute = 200; // Average reading speed
        const wordCount = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        setReadingTime(minutes);
      }
    }
  }, []);

  // Load saved font size from localStorage on component mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('article-font-size');
    const savedVisibility = localStorage.getItem('font-control-visibility');
    const savedReadingMode = localStorage.getItem('reading-mode');

    if (savedFontSize) {
      const size = parseInt(savedFontSize, 10);
      if (size >= minSize && size <= maxSize) {
        setFontSize(size);
        applyFontSize(size);
      }
    }

    if (savedVisibility !== null) {
      setIsVisible(savedVisibility === 'true');
    }

    if (savedReadingMode === 'true') {
      setIsReadingMode(true);
      document.body.classList.add('reading-mode-active');
      document.documentElement.style.setProperty('--reading-mode', 'true');
    }

    calculateReadingTime();
  }, [calculateReadingTime, minSize, maxSize]);

  const applyFontSize = useCallback((size: number) => {
    // Apply font size to the main article content
    const selectors = [
      'article .markdown',
      '.theme-doc-markdown',
      '.markdown > *',
      'article p',
      'article li',
      'article td',
      'article th'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.fontSize = `${size}px`;
        htmlElement.style.lineHeight = `${size * 1.6}px`;
      });
    });

    // Apply to code blocks with slightly smaller size
    const codeElements = document.querySelectorAll('code, pre code');
    codeElements.forEach((element) => {
      (element as HTMLElement).style.fontSize = `${size * 0.9}px`;
    });
  }, []);

  const handleFontSizeChange = useCallback((newSize: number) => {
    if (newSize >= minSize && newSize <= maxSize) {
      setFontSize(newSize);
      applyFontSize(newSize);
      localStorage.setItem('article-font-size', newSize.toString());
    }
  }, [applyFontSize, minSize, maxSize]);

  const increaseFontSize = () => handleFontSizeChange(fontSize + 1);
  const decreaseFontSize = () => handleFontSizeChange(fontSize - 1);
  const resetFontSize = () => handleFontSizeChange(16);

  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    localStorage.setItem('font-control-visibility', newVisibility.toString());
  };

  const toggleReadingMode = () => {
    const newReadingMode = !isReadingMode;
    setIsReadingMode(newReadingMode);

    console.log('Reading Mode toggled:', newReadingMode);

    if (newReadingMode) {
      document.body.classList.add('reading-mode-active');
      document.documentElement.style.setProperty('--reading-mode', 'true');
      console.log('Added reading-mode-active class to body');
    } else {
      document.body.classList.remove('reading-mode-active');
      document.documentElement.style.removeProperty('--reading-mode');
      console.log('Removed reading-mode-active class from body');
    }

    localStorage.setItem('reading-mode', newReadingMode.toString());
  };

  if (!isVisible) {
    return (
      <button
        className={styles.toggleButton}
        onClick={toggleVisibility}
        title="Show font size control"
        aria-label="Show font size control"
      >
        <svg viewBox="0 0 24 24" className={styles.toggleIcon}>
          <path d="M9 7h6v2H9zm0 4h6v2H9z"/>
        </svg>
      </button>
    );
  }

  return (
    <div className={`${styles.fontSizeControl} ${className || ''}`}>
      <div className={styles.header}>
        <span className={styles.title}>Font Size</span>
        <div className={styles.headerRight}>
          <span className={styles.currentSize}>{fontSize}px</span>
          <button
            className={styles.hideButton}
            onClick={toggleVisibility}
            title="Hide font size control"
            aria-label="Hide font size control"
          >
            ×
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.button}
          onClick={decreaseFontSize}
          disabled={fontSize <= minSize}
          title="Decrease font size (A-)"
          aria-label="Decrease font size"
        >
          <svg viewBox="0 0 24 24" className={styles.icon}>
            <path d="M19 13H5v-2h14v2z"/>
          </svg>
        </button>

        <div className={styles.sizeDisplay}>
          <span
            className={styles.sizeIndicator}
            style={{ fontSize: `${12 + (fontSize - minSize) * 0.5}px` }}
          >
            A
          </span>
        </div>

        <button
          className={styles.button}
          onClick={increaseFontSize}
          disabled={fontSize >= maxSize}
          title="Increase font size (A+)"
          aria-label="Increase font size"
        >
          <svg viewBox="0 0 24 24" className={styles.icon}>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>

      <div className={styles.readingSection}>
        {readingTime > 0 && (
          <div className={styles.readingTime}>
            <svg className={styles.readingTimeIcon} viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z" />
            </svg>
            {readingTime} min read
          </div>
        )}

        <div className={styles.readingModeToggle}>
          <span className={styles.readingModeLabel}>Reading Mode</span>
          <div
            className={`${styles.readingModeSwitch} ${isReadingMode ? styles.active : ''}`}
            onClick={toggleReadingMode}
            role="switch"
            aria-checked={isReadingMode}
            aria-label="Toggle reading mode"
            tabIndex={0}
          >
            <div className={styles.readingModeSwitchHandle} />
          </div>
        </div>
      </div>

      {fontSize !== 16 && (
        <button
          className={styles.resetButton}
          onClick={resetFontSize}
          title="Reset to default size (16px)"
        >
          Reset to Default
        </button>
      )}
    </div>
  );
};

export default FontSizeControl;
