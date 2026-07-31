'use client';

import {
  ElementType,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import './TextType.css';

interface TextTypeProps {
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string | React.ReactNode;
  cursorBlinkDuration?: number;
  cursorClassName?: string;
  text: string | string[];
  as?: ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  textColors?: string[];
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  onTextIndexChange?: (index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
  renderText?: (displayedText: string, fullText: string, index: number) => ReactNode;
}

const TextType = ({
  text,
  as: Component = 'div',
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  onTextIndexChange,
  startOnVisible = false,
  reverseMode = false,
  renderText,
  ...props
}: TextTypeProps & HTMLAttributes<HTMLElement>) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
  const hasStartedRef = useRef(false);

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  const getCurrentTextColor = () => {
    if (textColors.length === 0) return 'inherit';
    return textColors[currentTextIndex % textColors.length];
  };

  useEffect(() => {
    if (!startOnVisible || !containerEl) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerEl);
    return () => observer.disconnect();
  }, [startOnVisible, containerEl]);

  useEffect(() => {
    if (!isVisible) return;

    let timeout: ReturnType<typeof setTimeout>;
    const currentText = textArray[currentTextIndex];
    const processedText = reverseMode
      ? currentText.split('').reverse().join('')
      : currentText;

    if (isDeleting) {
      if (displayedText.length === 0) {
        if (currentTextIndex === textArray.length - 1 && !loop) return;

        timeout = setTimeout(() => {
          const next = (currentTextIndex + 1) % textArray.length;
          setIsDeleting(false);
          setCurrentTextIndex(next);
          setCurrentCharIndex(0);
          onTextIndexChange?.(next);
        }, 700);
      } else {
        timeout = setTimeout(() => {
          setDisplayedText(prev => prev.slice(0, -1));
        }, deletingSpeed);
      }
    } else if (currentCharIndex < processedText.length) {
      const isFirstCharEver =
        !hasStartedRef.current && currentCharIndex === 0 && displayedText === '';
      const delay = isFirstCharEver ? initialDelay : variableSpeed ? getRandomSpeed() : typingSpeed;

      timeout = setTimeout(() => {
        hasStartedRef.current = true;
        setDisplayedText(prev => prev + processedText[currentCharIndex]);
        setCurrentCharIndex(prev => prev + 1);
      }, delay);
    } else {
      if (!loop && currentTextIndex === textArray.length - 1) return;

      timeout = setTimeout(() => {
        onSentenceComplete?.(textArray[currentTextIndex], currentTextIndex);
        setIsDeleting(true);
      }, pauseDuration);
    }

    return () => clearTimeout(timeout);
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
    isVisible,
    reverseMode,
    variableSpeed,
    getRandomSpeed,
    onSentenceComplete,
    onTextIndexChange,
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping &&
    (currentCharIndex < textArray[currentTextIndex].length || isDeleting);

  const content =
    renderText?.(displayedText, textArray[currentTextIndex], currentTextIndex) ??
    displayedText;

  return (
    <Component
      ref={setContainerEl}
      className={`text-type ${className}`}
      {...props}
    >
      <span
        className="text-type__content"
        style={{ color: getCurrentTextColor() || 'inherit' }}
      >
        {content}
      </span>
      {showCursor ? (
        <span
          className={`text-type__cursor ${cursorClassName} ${shouldHideCursor ? 'text-type__cursor--hidden' : ''}`}
          style={{ animationDuration: `${cursorBlinkDuration * 2}s` }}
        >
          {cursorCharacter}
        </span>
      ) : null}
    </Component>
  );
};

export default TextType;
