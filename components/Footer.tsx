import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full p-4 sm:p-6 text-center text-gray-500 text-sm bg-white border-t border-gray-200">
      <p>&copy; {new Date().getFullYear()} FAIM. All rights reserved.</p>
      <p className="mt-1">Your trusted partner in finding the perfect home.</p>
    </footer>
  );
};

export default Footer;