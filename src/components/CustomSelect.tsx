import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate dropdown position when opening
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const dropdownHeight = Math.min(300, filteredOptions.length * 60 + 80);
      
      let top = rect.bottom + window.scrollY + 8;
      let left = rect.left + window.scrollX;
      let width = rect.width;
      
      if (isMobile) {
        // Mobile-specific positioning
        const mobileDropdownWidth = Math.min(viewportWidth * 0.9, 400); // 90vw or 400px max
        const mobileDropdownHeight = Math.min(viewportHeight * 0.7, dropdownHeight); // 70vh or calculated height
        
        // Center horizontally with proper margins
        left = Math.max(16, (viewportWidth - mobileDropdownWidth) / 2);
        width = mobileDropdownWidth;
        
        // Position vertically to stay within viewport
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        if (spaceBelow >= mobileDropdownHeight + 16) {
          // Position below button
          top = rect.bottom + 8;
        } else if (spaceAbove >= mobileDropdownHeight + 16) {
          // Position above button
          top = rect.top - mobileDropdownHeight - 8;
        } else {
          // Center in viewport with margins
          top = Math.max(16, (viewportHeight - mobileDropdownHeight) / 2);
        }
        
        // Ensure final position is within viewport bounds
        top = Math.max(16, Math.min(viewportHeight - mobileDropdownHeight - 16, top));
        left = Math.max(16, Math.min(viewportWidth - mobileDropdownWidth - 16, left));
      } else {
        // Desktop positioning (existing logic)
        // Check if dropdown would go below viewport
        if (rect.bottom + dropdownHeight > viewportHeight) {
          // Position above the button instead
          top = rect.top + window.scrollY - dropdownHeight - 8;
          
          // If still not enough space above, center it in viewport
          if (top < window.scrollY + 20) {
            top = window.scrollY + (viewportHeight - dropdownHeight) / 2;
          }
        }
        
        // Ensure dropdown doesn't go off-screen horizontally
        if (left + width > viewportWidth - 16) {
          left = Math.max(16, viewportWidth - width - 16);
        }
      }
      
      setDropdownPosition({
        top,
        left,
        width
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        // Check if click is inside the portal dropdown
        const dropdownElement = document.getElementById('dropdown-portal');
        if (!dropdownElement || !dropdownElement.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
          setIsAnimating(false);
        }
      }
    };

    const handleScroll = () => {
      if (isOpen && !isMobile) {
        updateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        // Add a small delay to ensure the resize is complete
        setTimeout(() => {
          updateDropdownPosition();
        }, 100);
      }
    };

    // Prevent body scroll on mobile when dropdown is open
    const handleTouchMove = (e: TouchEvent) => {
      if (isOpen && isMobile) {
        // Allow scrolling within the dropdown
        const dropdownElement = document.getElementById('dropdown-portal');
        if (dropdownElement && dropdownElement.contains(e.target as Node)) {
          return; // Allow scrolling within dropdown
        }
        e.preventDefault(); // Prevent body scroll
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
      
      if (isMobile) {
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        // Prevent zoom on double tap
        document.addEventListener('touchstart', (e) => {
          if (e.touches.length > 1) {
            e.preventDefault();
          }
        }, { passive: false });
        // Handle orientation change
        window.addEventListener('orientationchange', handleResize);
      }
      
      updateDropdownPosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (isOpen && searchRef.current && !isMobile) {
      // Only auto-focus search on desktop to prevent mobile keyboard issues
      setTimeout(() => {
        if (searchRef.current) {
          searchRef.current.focus({ preventScroll: true });
        }
      }, 100);
    }
  }, [isOpen, isMobile]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    setIsAnimating(false);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled) {
      if (!isOpen) {
        setIsAnimating(true);
        setIsOpen(true);
      } else {
        setIsOpen(false);
        setIsAnimating(false);
      }
    }
  };

  // Enhanced dropdown content with better animations
  const dropdownContent = isOpen && !disabled && (
    <div
      id="dropdown-portal"
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        maxWidth: isMobile ? '400px' : 'none',
        transform: 'none',
        zIndex: 10000,
        maxHeight: isMobile ? '70vh' : '300px'
      }}
      className={`
        bg-dark-secondary border border-gray-700 rounded-lg shadow-2xl overflow-hidden
        ${isAnimating ? 'animate-in' : ''}
        transition-all duration-200 ease-out
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Mobile overlay background */}
      {isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[-1] transition-opacity duration-200"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
            setIsAnimating(false);
          }}
        />
      )}
      
      {/* Search Input */}
      <div className={`p-3 border-b border-gray-700 bg-dark-secondary ${isMobile ? 'sticky top-0' : ''}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-3 py-2 bg-dark-primary border border-gray-700 rounded-md text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
              isMobile ? 'text-base' : 'text-sm'
            }`}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => {
              e.target.setSelectionRange(0, 0);
              // Prevent scroll on mobile
              if (isMobile) {
                e.preventDefault();
              }
            }}
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      </div>

      {/* Options List */}
      <div 
        className={`overflow-y-auto bg-dark-secondary ${
          isMobile ? 'max-h-[50vh]' : 'max-h-48'
        }`}
        style={{
          // Smooth scrolling on mobile
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => (
            <button
              key={option.value}
              type="button"
              className={`
                w-full px-4 py-3 text-left hover:bg-dark-primary transition-colors duration-150
                ${value === option.value ? 'bg-blue-600/20 border-r-2 border-blue-500' : ''}
                ${isMobile ? 'py-4 text-base' : 'py-3 text-sm'}
                transform transition-transform duration-150 hover:scale-[1.02]
              `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOptionClick(option.value);
              }}
              onTouchStart={(e) => e.stopPropagation()}
              style={{
                animationDelay: `${index * 20}ms`
              }}
            >
              <div className={`font-medium text-white ${isMobile ? 'text-base' : 'text-sm'}`}>
                {option.label}
              </div>
              {option.description && (
                <div className={`text-gray-400 mt-1 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                  {option.description}
                </div>
              )}
            </button>
          ))
        ) : (
          <div className={`px-4 py-3 text-gray-400 text-center ${isMobile ? 'py-6 text-base' : 'py-3 text-sm'}`}>
            No options found
          </div>
        )}
      </div>
      
      {/* Mobile close button */}
      {isMobile && (
        <div className="p-3 border-t border-gray-700 bg-dark-secondary">
          <button
            onClick={() => {
              setIsOpen(false);
              setSearchTerm('');
              setIsAnimating(false);
            }}
            className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          className={`
            w-full flex items-center justify-between px-4 py-3 text-left bg-dark-primary border border-gray-700 rounded-lg
            transition-all duration-200 ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 active:scale-[0.99]'
            } ${isOpen ? 'border-blue-500 ring-1 ring-blue-500 shadow-lg' : ''}
            ${isMobile ? 'min-h-[48px]' : ''}
          `}
          onClick={handleButtonClick}
          disabled={disabled}
          onFocus={(e) => {
            if (isMobile) {
              e.preventDefault();
            }
          }}
        >
          <div className="flex-1 min-w-0">
            {selectedOption ? (
              <div>
                <div className={`text-white font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
                  {selectedOption.label}
                </div>
                {selectedOption.description && (
                  <div className={`text-gray-400 truncate ${isMobile ? 'text-sm' : 'text-xs'}`}>
                    {selectedOption.description}
                  </div>
                )}
              </div>
            ) : (
              <span className={`text-gray-400 ${isMobile ? 'text-base' : 'text-sm'}`}>
                {placeholder}
              </span>
            )}
          </div>
          <ChevronDown 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
              isMobile ? 'ml-2' : 'ml-1'
            }`} 
          />
        </button>

        {/* Render dropdown in portal to document.body */}
        {typeof document !== 'undefined' && createPortal(
          dropdownContent,
          document.body
        )}
      </div>
    </div>
  );
};

export default CustomSelect;