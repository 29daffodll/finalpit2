import { useEffect } from 'react';

const Products = () => {
  useEffect(() => {
    window.location.href = 'https://pms-five-weld.vercel.app/products';
  }, []);

  return null;
};

export default Products; 