/**
 * Web UI Templates Enhanced (Enhanced with Design Tokens)
 * Reusable components for consistent styling across the web frontend
 * Mirrors the mobile UITemplates but adapted for React + Tailwind
 */

import React from 'react';
import { FaSpinner, FaInbox, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { DESIGN_TOKENS, getBadgeClasses, getButtonClasses } from '../utils/designTokens';

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'lg',
  showBackdrop = true 
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <FaSpinner 
        size={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
        style={{ color: DESIGN_TOKENS.COLORS.brand.primary }}
        className="animate-spin"
      />
      {message && (
        <p 
          className="text-sm font-semibold"
          style={{ color: DESIGN_TOKENS.COLORS.text.secondary }}
        >
          {message}
        </p>
      )}
    </div>
  );

  if (showBackdrop) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
      >
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Empty State Component
 */
export const EmptyState = ({
  icon: Icon = FaInbox,
  title = 'No Data',
  subtitle = 'Nothing to display',
  actionLabel,
  onActionPress,
  iconSize = 64,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Icon 
        size={iconSize}
        style={{ 
          color: DESIGN_TOKENS.COLORS.neutral[300],
          marginBottom: DESIGN_TOKENS.SPACING.lg
        }}
      />
      <h3 
        className="text-lg font-bold mb-2"
        style={{ color: DESIGN_TOKENS.COLORS.text.primary }}
      >
        {title}
      </h3>
      <p 
        className="text-sm mb-6"
        style={{ color: DESIGN_TOKENS.COLORS.text.secondary }}
      >
        {subtitle}
      </p>
      {actionLabel && onActionPress && (
        <button
          onClick={onActionPress}
          className="px-6 py-2 rounded-lg font-semibold transition-all hover:shadow-lg"
          style={{
            backgroundColor: DESIGN_TOKENS.COLORS.brand.primary,
            color: DESIGN_TOKENS.COLORS.text.onBrand,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/**
 * Error State Component
 */
export const ErrorState = ({
  title = 'Error',
  message = 'Something went wrong',
  actionLabel = 'Retry',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
      <FaExclamationCircle 
        size={48}
        style={{ color: DESIGN_TOKENS.COLORS.status.unavailable }}
      />
      <h3 
        className="text-lg font-bold"
        style={{ color: DESIGN_TOKENS.COLORS.status.unavailable }}
      >
        {title}
      </h3>
      <p 
        className="text-sm text-center"
        style={{ color: DESIGN_TOKENS.COLORS.text.secondary }}
      >
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-6 py-2 rounded-lg font-semibold transition-all"
          style={{
            backgroundColor: DESIGN_TOKENS.COLORS.status.unavailable,
            color: DESIGN_TOKENS.COLORS.text.onBrand,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/**
 * Badge Component
 */
export const Badge = ({
  label,
  variant = 'neutral',
  icon: Icon,
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const badgeClass = getBadgeClasses(variant);
  const [bgClass, borderClass, ...textClass] = badgeClass.split(' ');

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${sizeMap[size]}`}
      style={{
        backgroundColor: bgClass.includes('bg-') ? 
          DESIGN_TOKENS.COLORS[variant === 'success' ? 'status' : 'neutral']?.available || '#d1fae5' : 
          'transparent',
        borderColor: borderClass.includes('border-') ? '#10b981' : 'transparent',
        color: textClass.join(' ').includes('text-emerald') ? DESIGN_TOKENS.COLORS.status.available : '#10b981',
      }}
    >
      {Icon && <Icon size={size === 'sm' ? 12 : 14} />}
      <span>{label}</span>
    </div>
  );
};

/**
 * Button Component
 */
export const Button = ({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  loading = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  const variantColorMap = {
    primary: DESIGN_TOKENS.COLORS.brand.primary,
    secondary: DESIGN_TOKENS.COLORS.neutral[100],
    danger: DESIGN_TOKENS.COLORS.brand.danger,
  };

  const variantTextMap = {
    primary: DESIGN_TOKENS.COLORS.text.onBrand,
    secondary: DESIGN_TOKENS.COLORS.text.primary,
    danger: DESIGN_TOKENS.COLORS.text.onBrand,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 rounded-lg font-semibold 
        transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeMap[size]}
        ${className}
      `}
      style={{
        backgroundColor: variantColorMap[variant],
        color: variantTextMap[variant],
      }}
    >
      {loading ? (
        <FaSpinner className="animate-spin" size={size === 'sm' ? 12 : 14} />
      ) : (
        Icon && <Icon size={size === 'sm' ? 12 : 14} />
      )}
      <span>{label}</span>
    </button>
  );
};

/**
 * Card Component
 */
export const Card = ({
  children,
  className = '',
  onClick,
  shadow = 'md',
}) => {
  const shadowMap = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg p-4 transition-all 
        hover:shadow-lg
        ${onClick ? 'cursor-pointer' : ''}
        ${shadowMap[shadow]}
        ${className}
      `}
      style={{
        backgroundColor: DESIGN_TOKENS.COLORS.background.primary,
        border: `1px solid ${DESIGN_TOKENS.COLORS.border.light}`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Divider Component
 */
export const Divider = ({ 
  margin = 'my-4',
  color = 'border-light'
}) => {
  return (
    <div
      className={`${margin}`}
      style={{ 
        borderTop: `1px solid ${DESIGN_TOKENS.COLORS.border.light}` 
      }}
    />
  );
};

/**
 * Section Header Component
 */
export const SectionHeader = ({
  title,
  icon: Icon,
  actionLabel,
  onActionPress,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon 
            size={20}
            style={{ color: DESIGN_TOKENS.COLORS.brand.primary }}
          />
        )}
        <h2
          className="text-lg font-bold"
          style={{ color: DESIGN_TOKENS.COLORS.text.primary }}
        >
          {title}
        </h2>
      </div>
      {actionLabel && onActionPress && (
        <button
          onClick={onActionPress}
          className="text-sm font-semibold transition-colors hover:opacity-70"
          style={{ color: DESIGN_TOKENS.COLORS.brand.primary }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/**
 * Status Indicator Component
 */
export const StatusIndicator = ({
  status,
  showLabel = true,
}) => {
  const statusConfig = {
    available: {
      color: DESIGN_TOKENS.COLORS.status.available,
      label: 'Available',
    },
    unavailable: {
      color: DESIGN_TOKENS.COLORS.status.unavailable,
      label: 'Unavailable',
    },
    pending: {
      color: DESIGN_TOKENS.COLORS.status.pending,
      label: 'Pending',
    },
    overdue: {
      color: DESIGN_TOKENS.COLORS.status.overdue,
      label: 'Overdue',
    },
    returned: {
      color: DESIGN_TOKENS.COLORS.status.returned,
      label: 'Returned',
    },
  };

  const config = statusConfig[status] || statusConfig.unavailable;

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {showLabel && (
        <span 
          className="text-xs font-semibold"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
};

/**
 * Progress Bar Component
 */
export const ProgressBar = ({
  progress = 0,
  label,
  showPercentage = true,
}) => {
  const percentage = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between mb-2">
          {label && (
            <p 
              className="text-sm font-semibold"
              style={{ color: DESIGN_TOKENS.COLORS.text.primary }}
            >
              {label}
            </p>
          )}
          {showPercentage && (
            <p 
              className="text-sm font-semibold"
              style={{ color: DESIGN_TOKENS.COLORS.text.secondary }}
            >
              {percentage}%
            </p>
          )}
        </div>
      )}
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: DESIGN_TOKENS.COLORS.background.tertiary }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: DESIGN_TOKENS.COLORS.brand.primary,
          }}
        />
      </div>
    </div>
  );
};

/**
 * Alert Box Component
 */
export const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
}) => {
  const typeConfig = {
    info: {
      bg: '#dbeafe',
      border: '#3b82f6',
      text: '#3b82f6',
      icon: FaExclamationCircle,
    },
    success: {
      bg: '#d1fae5',
      border: DESIGN_TOKENS.COLORS.status.available,
      text: DESIGN_TOKENS.COLORS.status.available,
      icon: FaCheckCircle,
    },
    warning: {
      bg: '#fef3c7',
      border: DESIGN_TOKENS.COLORS.status.warning,
      text: '#d97706',
      icon: FaExclamationCircle,
    },
    error: {
      bg: '#fee2e2',
      border: DESIGN_TOKENS.COLORS.status.unavailable,
      text: DESIGN_TOKENS.COLORS.status.unavailable,
      icon: FaExclamationCircle,
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className="p-4 rounded-lg border flex items-start gap-3"
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
      }}
    >
      <Icon size={20} style={{ color: config.text, marginTop: '2px' }} />
      <div className="flex-1">
        {title && (
          <h4 
            className="font-bold text-sm mb-1"
            style={{ color: config.text }}
          >
            {title}
          </h4>
        )}
        {message && (
          <p 
            className="text-sm"
            style={{ color: config.text }}
          >
            {message}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-lg opacity-60 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default {
  LoadingSpinner,
  EmptyState,
  ErrorState,
  Badge,
  Button,
  Card,
  Divider,
  SectionHeader,
  StatusIndicator,
  ProgressBar,
  Alert,
};
