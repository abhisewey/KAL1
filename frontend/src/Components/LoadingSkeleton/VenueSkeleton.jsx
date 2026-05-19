import React from 'react';
import './VenueSkeleton.css';

/**
 * VenueSkeleton Component
 * 
 * Provides a premium, fluid loading state for VenueCards while data is being fetched.
 * Utilizes a shimmering gradient animation to indicate activity.
 */
const VenueSkeleton = () => {
  return (
    <div className="venue-skeleton" aria-hidden="true">
      {/* Hero Image Skeleton */}
      <div className="skeleton-img pulse"></div>
      
      {/* Content Skeleton */}
      <div className="skeleton-body">
        <div className="skeleton-meta">
          <div className="skeleton-pill pulse" style={{ width: '64px' }}></div>
          <div className="skeleton-pill pulse" style={{ width: '48px' }}></div>
        </div>
        
        <div className="skeleton-title pulse"></div>
        
        <div className="skeleton-address pulse"></div>
        <div className="skeleton-address pulse" style={{ width: '60%', marginTop: '-4px' }}></div>
      </div>
    </div>
  );
};

export default VenueSkeleton;
