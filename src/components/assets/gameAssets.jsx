import React from 'react';

export const UnicornSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 65 L20 85 M40 65 L40 85 M60 65 L60 85 M80 65 L80 85" stroke="#f472b6" strokeWidth="4" />
    <path d="M20 65 Q 20 40 40 40 L 70 40 Q 90 40 90 60 L 90 65 L 20 65 Z" fill="#fff" stroke="#f472b6" strokeWidth="3" />
    <path d="M70 40 L 70 25 Q 70 10 90 15 L 95 25 Q 90 40 70 40" fill="#fff" stroke="#f472b6" strokeWidth="3" />
    <path d="M85 15 L 95 0 L 92 18" fill="#facc15" stroke="#eab308" />
    <path d="M20 45 Q 0 45 5 70" stroke="#a855f7" strokeWidth="4" />
    <path d="M70 25 Q 60 25 65 45" stroke="#3b82f6" strokeWidth="4" />
    <circle cx="85" cy="25" r="2" fill="#000" />
  </svg>
);

// COIN IMAGES
export const COIN_ASSETS = {
  penny: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/US_One_Cent_Obv.png/240px-US_One_Cent_Obv.png",
  nickel: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/US_Nickel_2013_Obv.png/240px-US_Nickel_2013_Obv.png",
  dime: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Dime_Obverse_13.png/240px-Dime_Obverse_13.png",
  quarter: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/2006_Quarter_Proof.png/240px-2006_Quarter_Proof.png"
};

// BILL IMAGES
export const BILL_ASSETS = {
  1: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/US_one_dollar_bill%2C_obverse%2C_series_2009.jpg/640px-US_one_dollar_bill%2C_obverse%2C_series_2009.jpg",
  5: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/US_%245_Series_2006_Obverse.jpg/640px-US_%245_Series_2006_Obverse.jpg",
  10: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/US10dollarbill-Series_2004A.jpg/640px-US10dollarbill-Series_2004A.jpg",
  20: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/US_%2420_Series_2006_Obverse.jpg/640px-US_%2420_Series_2006_Obverse.jpg",
  50: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/US_%2450_Series_2006_Obverse.jpg/640px-US_%2450_Series_2006_Obverse.jpg",
  100: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/US_%24100_Series_2009_Obverse.jpg/640px-US_%24100_Series_2009_Obverse.jpg"
};

export const Coin = ({ type, onClick, disabled }) => {
  const size = type === 'quarter' ? 100 : type === 'nickel' ? 85 : type === 'penny' ? 75 : 70;
  return (
    <button onClick={onClick} disabled={disabled} className={`transition-transform ${disabled ? 'opacity-50' : 'hover:scale-110 active:scale-95 cursor-pointer'}`}>
      <img src={COIN_ASSETS[type]} alt={type} style={{ width: size, height: size }} className="drop-shadow-xl object-contain" />
    </button>
  );
};

export const Bill = ({ value, onClick, disabled }) => {
  return (
    <button onClick={onClick} disabled={disabled} className={`transition-transform ${disabled ? 'opacity-50' : 'hover:scale-105 active:scale-95 cursor-pointer'}`}>
      <img src={BILL_ASSETS[value]} alt={`$${value}`} className="w-40 drop-shadow-xl rounded-md" />
    </button>
  );
};