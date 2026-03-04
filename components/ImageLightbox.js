"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  VisuallyHidden,
} from "./ui/dialog";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";

// Context so ClickableImageCard can call open(index)
const LightboxContext = createContext(() => {});
export function useLightboxOpen() {
  return useContext(LightboxContext);
}

export default function ImageLightbox({ items, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const open = useCallback((index) => {
    setCurrentIndex(index);
    setDirection(0);
    setIsOpen(true);
  }, []);

  const goNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(1);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setDirection(0);
      setIsAnimating(false);
    }, 200);
  }, [items.length, isAnimating]);

  const goPrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(-1);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      setDirection(0);
      setIsAnimating(false);
    }, 200);
  }, [items.length, isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goNext, goPrev]);

  const current = items[currentIndex];
  const project = current?.project;

  const imageStyle = {
    opacity: direction !== 0 ? 0 : 1,
    transform: direction !== 0 ? `translateX(${direction * 20}px)` : "translateX(0)",
    transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
  };

  return (
    <LightboxContext.Provider value={open}>
      {children}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          showClose={false}
          className="lightbox-dialog-content"
          onClick={(e) => {
            // Close when clicking the backdrop area (not the lightbox card)
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <VisuallyHidden.Root>
            <DialogTitle>
              {project ? project.title : current?.alt || "Image"}
            </DialogTitle>
          </VisuallyHidden.Root>
          <VisuallyHidden.Root>
            <DialogDescription>
              {project ? project.description : "Portfolio image"}
            </DialogDescription>
          </VisuallyHidden.Root>

          <div className="lightbox-layout">
            <button
              className="lightbox-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            {/* Image panel */}
            <div className="lightbox-image-panel">
              <div style={imageStyle}>
                {current && (
                  <img
                    src={current.src}
                    alt={current.alt}
                    className="lightbox-image"
                  />
                )}
              </div>
            </div>

            {/* Details panel */}
            <div className="lightbox-details-panel">
              <div className="lightbox-details-inner">
                {project ? (
                  <>
                    <h2 className="lightbox-title">{project.title}</h2>
                    <p className="lightbox-description">{project.description}</p>
                    {project.url && !project.isWip && (
                      <a
                        className="lightbox-link"
                        href={project.url}
                        target={project.isExternal ? "_blank" : undefined}
                        rel={project.isExternal ? "noopener noreferrer" : undefined}
                      >
                        View Case Study
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </>
                ) : (
                  <h2 className="lightbox-title">{current?.alt}</h2>
                )}
              </div>

              <div className="lightbox-footer">
                <div className="lightbox-counter">
                  {currentIndex + 1} / {items.length}
                </div>
                <div className="lightbox-nav">
                  <button
                    className="lightbox-nav-btn"
                    onClick={goPrev}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className="lightbox-nav-btn"
                    onClick={goNext}
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </LightboxContext.Provider>
  );
}
