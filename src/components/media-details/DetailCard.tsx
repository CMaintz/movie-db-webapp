import React from 'react';

/**
 * The frosted panel every details section sits in. Extracted because the same
 * six utility classes were repeated across all five sections — changing the
 * look meant editing five places and missing one.
 */
const DetailCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-bg-paper/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10">
    {children}
  </div>
);

export default DetailCard;
